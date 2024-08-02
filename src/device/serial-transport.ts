"use strict";

export interface Stat {
    stMode: number;
    stIno: number;
    stDev: number;
    stNlink: number;
    stUid: number;
    stGid: number;
    stSize: number;
    stAtime: number;
    stMtime: number;
    stCtime: number;
}

export interface ListDirContent {
    name: string;
    stMode: number;
    stIno: number;
    stSize: number;
}

export default class SerialTransport {
    port: SerialPort | null;
    reader: ReadableStreamDefaultReader<Uint8Array> | null;
    writer: WritableStreamDefaultWriter<Uint8Array> | null;
    commandMode: boolean;
    connected: boolean;
    te: TextEncoder;
    td: TextDecoder;

    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.commandMode = false;
        this.connected = false;
        this.te = new TextEncoder();
        this.td = new TextDecoder();
    }

    async initSerial(): Promise<boolean> {
        try {
            const ports = await navigator.serial.getPorts();
            this.port = ports.find((prt) => prt.getInfo().usbProductId === 16385) || await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 });
            this.reader = this.port.readable!.getReader();
            this.writer = this.port.writable!.getWriter();
            this.connected = true;
            return true;
        } catch (e) {
            console.log(e);
            this.connected = false;
            return false;
        }
    }

    async regainReader(): Promise<void> {
        if (!this.port!.readable!.locked) {
            await this.reader!.cancel();
            this.reader = this.port!.readable!.getReader();
        }
    }

    async regainWriter(): Promise<void> {
        if (!this.port!.writable!.locked) {
            //   await this.writer!.cancel();
            this.writer = this.port!.writable!.getWriter();
        }
    }

    async write(data: string): Promise<void> {
        await this.writer!.write(this.te.encode(data));
    }

    async read(): Promise<string | null> {
        const { value, done } = await this.reader!.read();
        return done ? null : this.td.decode(value!);
    }

    async dataConsumerIRQ(consumer: (data: string) => void): Promise<void> {
        if (!this.connected) throw new Error("Serial port is not connected.");
        while (this.connected) {
            if (!this.commandMode) {
                const { value, done } = await this.reader!.read();
                if (done) {
                    await this.delay(1000);
                    continue;
                }
                !this.commandMode && consumer(this.td.decode(value!));
            } else {
                await this.delay(1000);
            }
        }
    }
    async deInit(): Promise<void> {
        if (this.port !== null) {
            await this.reader?.cancel();
            await this.writer?.close();
            await this.port.close();

            this.port = null;
            this.reader = null;
            this.writer = null;

            this.connected = false;
        }
    }

    async readUntil(ends: string, timeout = 1000): Promise<string> {
        let readData = "";
        let timeoutHandle: NodeJS.Timeout | null = null;

        const resetTimeout = () => {
            if (timeoutHandle) clearTimeout(timeoutHandle);
            timeoutHandle = setTimeout(() => this.reader!.cancel(), timeout);
        };

        try {
            while (true) {
                resetTimeout();
                const { value, done } = await this.reader!.read();
                readData += this.td.decode(value!);

                if (readData.endsWith(ends)) {
                    if (timeoutHandle) clearTimeout(timeoutHandle);
                    return readData;
                }

                if (done) throw new Error("timeout: readerStream closed.");
            }
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
        }
    }

    async enterRawRepl(softReset = true): Promise<boolean> {
        this.commandMode = true;
        await this.write("\r\x03\x03");
        await this.delay(100);
        await this.write("\r\x01");

        if (softReset) {
            await this.readUntil("raw REPL; CTRL-B to exit\r\n>");
            await this.write("\x04");
        }
        await this.readUntil("raw REPL; CTRL-B to exit\r\n>");
        return true;
    }

    async exitRawRepl(): Promise<boolean> {
        await this.write("\r\x02");
        this.commandMode = false;
        return true;
    }

    async exec(command: string, timeout = 1000): Promise<string> {
        const encodedCommand = this.te.encode(command);
        for (let i = 0; i < encodedCommand.length; i += 256) {
            await this.writer!.write(encodedCommand.subarray(i, Math.min(i + 256, encodedCommand.length)));
            await this.delay(10);
        }
        await this.writer!.write(this.te.encode("\x04"));
        let data = await this.readUntil(">", timeout);
        return data.slice(2, -1);
    }

    async setTime(): Promise<void> {
        const date = new Date();
        const dateTuple = `(${date.getFullYear()}, ${date.getMonth() + 1}, ${date.getDate()}, ${(date.getDay() + 6) % 7}, ${date.getHours()}, ${date.getMinutes()}, ${date.getSeconds()}, ${date.getMilliseconds()})`;
        const cmd = `import machine\nmachine.RTC().datetime(${dateTuple})`;

        await this.enterRawRepl();
        await this.exec(cmd);
        await this.exitRawRepl();
    }

    async getTime(): Promise<string> {
        const cmd = `import machine\nprint(machine.RTC().datetime())`;
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(cmd));
        await this.exitRawRepl();
        return data;
    }

    async printHelloWorld(): Promise<void> {
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec("print('Hello, world!')"));
        await this.exitRawRepl();
        console.log(data.replace("\x04", ""));
    }

    // ---- FileSystem method ---- Start ----
    async fsExists(src = ""): Promise<boolean> {
        const cmd = `import os\nos.stat('${src}')`;
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(cmd));
        await this.exitRawRepl();
        return !data.endsWith("ENOENT\r\n");
    }

    async fsLs(src = ""): Promise<void> {
        const cmd = `import os\nfor f in os.ilistdir('${src}'):\n print('{:12} {}{}'.format(f[3] if len(f) > 3 else 0, f[0], '/' if f[1] & 0x4000 else ''))`;

        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(cmd));
        await this.exitRawRepl();
        console.log(data);
    }

    async fsListdir(src = ""): Promise<ListDirContent[]> {
        const cmd = `import os\nfor f in os.ilistdir('${src}'):\n    print(repr(f), end=',')`;

        await this.enterRawRepl();
        const data = await this.exec(cmd);
        await this.exitRawRepl();

        const cleanData = this.removeControlCharacter(data);

        if (cleanData.endsWith("ENOENT\r\n")) {
            throw new FilesystemError("No such file or directory.");
        }

        return this.parseListDirContent(cleanData.slice(0, -1));
    }

    async fsStat(src: string): Promise<Stat | null> {
        const cmd = `import os\nprint(repr(os.stat('${src}')))`;
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(cmd));
        await this.exitRawRepl();

        if (data.endsWith("ENOENT\r\n")) {
            throw new FilesystemError("No such file or directory.");
        } else if (data.endsWith("EPERM\r\n")) {
            throw new FilesystemError("Operation not permitted.");
        }

        return this.parseStat(data.replace(/\(/g, "[").replace(/\)/g, "]"));
    }

    async fsReadfile(src: string, chunkSize = 256): Promise<Uint8Array> {
        const cmd = `with open('${src}', 'rb') as f:\n while 1:\n  b=f.read(${chunkSize})\n  if not b:break\n  print(b, end='')`;

        await this.enterRawRepl();
        let data = this.removeControlCharacter(await this.exec(cmd));
        await this.exitRawRepl();

        if (data.endsWith("ENOENT\r\n")) {
            throw new FilesystemError("No such file or directory.");
        } else if (data.endsWith("EPERM\r\n")) {
            throw new FilesystemError("Operation not permitted.");
        }

        return eval(data.slice(1));
    }

    async fsWritefile(dest: string, data: Uint8Array, chunkSize = 256): Promise<void> {
        if (!(data instanceof Uint8Array)) {
            throw new Error("Data should be a Uint8Array.");
        }

        await this.enterRawRepl();
        await this.exec(`f=open('${dest}', 'wb')\nw=f.write`);
        while (data.length > 0) {
            const chunk = data.subarray(0, chunkSize);
            await this.exec(`w(b'${this.decodeAscii(chunk)}')`);
            data = data.subarray(chunk.length);
        }
        await this.exec("f.close()");
        await this.exitRawRepl();
    }

    async fsMkdir(dir: string): Promise<string> {
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(`import os\nos.mkdir('${dir}')`));
        await this.exitRawRepl();
        return data;
    }

    async fsRmdir(dir: string): Promise<string> {
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(`import os\nos.rmdir('${dir}')`));
        await this.exitRawRepl();
        return data;
    }

    async fsRm(src: string): Promise<string> {
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(`import os\nos.remove('${src}')`));
        await this.exitRawRepl();
        return data;
    }

    async fsTouch(src: string): Promise<string> {
        await this.enterRawRepl();
        const data = this.removeControlCharacter(await this.exec(`f=open('${src}', 'a')\nf.close()`));
        await this.exitRawRepl();
        return data;
    }
    // ---- FileSystem method ---- End ----

    parseStat(data: string): Stat | null {
        try {
            const jsonData = JSON.parse(data);
            if (!Array.isArray(jsonData) || jsonData.length < 10) {
                throw new Error("Invalid data format");
            }
            const [
                stMode,
                stIno,
                stDev,
                stNlink,
                stUid,
                stGid,
                stSize,
                stAtime,
                stMtime,
                stCtime,
            ] = jsonData;
            return {
                stMode,
                stIno,
                stDev,
                stNlink,
                stUid,
                stGid,
                stSize,
                stAtime,
                stMtime,
                stCtime,
            };
        } catch (error) {
            console.error("Failed to parse stat data:", error);
            return null;
        }
    }

    parseListDirContent(data: string): ListDirContent[] {
        const jsonData = JSON.parse(`[${data.replace(/\(/g, "[").replace(/\)/g, "]").replace(/'/g, '"')}]`);
        return jsonData.map((item: any) => ({
            name: item[0],
            stMode: item[1],
            stIno: item[2],
            stSize: item[3],
        }));
    }

    decodeAscii(buffer: Uint8Array): string {
        const specialChars: { [key: number]: string } = {
            0x27: "\\'",
            0x5c: "\\\\",
            0x09: "\\t",
            0x0a: "\\n",
            0x0d: "\\r",
        };
        return Array.from(buffer)
            .map(
                (charCode) =>
                    specialChars[charCode] ||
                    (charCode > 0x1f && charCode < 0x7f
                        ? String.fromCharCode(charCode)
                        : `\\x${charCode.toString(16).padStart(2, "0")}`)
            )
            .join("");
    }

    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    removeControlCharacter(str: string): string {
        return str.replace(/\x04|\u0004/g, "");
    }
}

class FilesystemError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FilesystemError";
    }
}
