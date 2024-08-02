/**
 * (c) 2024, Manob Biswas and Bitsflow:bit Educational Foundation
 *
 * SPDX-License-Identifier: MIT
 */
class TransportError extends Error {
    constructor(message: string, public data?: any) {
        super(message);
    }
}

class SerialTransport {
    private inRawRepl: boolean = false;
    private useRawPaste: boolean = true;
    private mounted: boolean = false;
    private serial: SerialPort;

    constructor(serial: SerialPort) {
        this.serial = serial;
    }

    close() {
        this.serial.close();
    }

    private async readUntil(minNumBytes: number, ending: Buffer, timeout: number = 10, dataConsumer?: (data: Buffer) => void): Promise<Buffer> {
        let reader =  this.serial.readable!.getReader();
        const {value, done} = await reader.read();
        if (dataConsumer) dataConsumer(value);
        let timeoutCount = 0;

        while (true) {
            if (data.slice(-ending.length).equals(ending)) break;
            else if (this.serial.readableLength > 0) {
                const newData = await this.serial.read(1) as Buffer;
                if (dataConsumer) {
                    dataConsumer(newData);
                    data = newData;
                } else {
                    data = Buffer.concat([data, newData]);
                }
                timeoutCount = 0;
            } else {
                timeoutCount += 1;
                if (timeout !== null && timeoutCount >= 100 * timeout) break;
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        return data;
    }

    async enterRawRepl(softReset: boolean = true) {
        this.serial.write('\r\x03\x03');

        // flush input
        while (this.serial.readableLength > 0) {
            this.serial.read(this.serial.readableLength);
        }

        this.serial.write('\r\x01');

        if (softReset) {
            let data = await this.readUntil(1, Buffer.from('raw REPL; CTRL-B to exit\r\n>'));
            if (!data.slice(-23).equals(Buffer.from('raw REPL; CTRL-B to exit\r\n>'))) {
                throw new TransportError('could not enter raw repl', data);
            }

            this.serial.write('\x04');
            data = await this.readUntil(1, Buffer.from('soft reboot\r\n'));
            if (!data.slice(-13).equals(Buffer.from('soft reboot\r\n'))) {
                throw new TransportError('could not enter raw repl', data);
            }
        }

        let data = await this.readUntil(1, Buffer.from('raw REPL; CTRL-B to exit\r\n'));
        if (!data.slice(-23).equals(Buffer.from('raw REPL; CTRL-B to exit\r\n'))) {
            throw new TransportError('could not enter raw repl', data);
        }

        this.inRawRepl = true;
    }

    async exitRawRepl() {
        this.serial.write('\r\x02');
        this.inRawRepl = false;
    }

    async follow(timeout: number, dataConsumer?: (data: Buffer) => void): Promise<[Buffer, Buffer]> {
        let data = await this.readUntil(1, Buffer.from('\x04'), timeout, dataConsumer);
        if (!data.slice(-1).equals(Buffer.from('\x04'))) {
            throw new TransportError('timeout waiting for first EOF reception', data);
        }
        data = data.slice(0, -1);

        let dataErr = await this.readUntil(1, Buffer.from('\x04'), timeout);
        if (!dataErr.slice(-1).equals(Buffer.from('\x04'))) {
            throw new TransportError('timeout waiting for second EOF reception', dataErr);
        }
        dataErr = dataErr.slice(0, -1);

        return [data, dataErr];
    }

    async rawPasteWrite(commandBytes: Buffer) {
        let data = await this.serial.read(2);
        let windowSize = data.readUInt16LE(0);
        let windowRemain = windowSize;

        let i = 0;
        while (i < commandBytes.length) {
            while (windowRemain === 0 || this.serial.readableLength > 0) {
                data = await this.serial.read(1);
                if (data.equals(Buffer.from('\x01'))) {
                    windowRemain += windowSize;
                } else if (data.equals(Buffer.from('\x04'))) {
                    this.serial.write('\x04');
                    return;
                } else {
                    throw new TransportError('unexpected read during raw paste', data);
                }
            }

            const chunk = commandBytes.slice(i, i + windowRemain);
            this.serial.write(chunk);
            windowRemain -= chunk.length;
            i += chunk.length;
        }

        this.serial.write('\x04');

        data = await this.readUntil(1, Buffer.from('\x04'));
        if (!data.slice(-1).equals(Buffer.from('\x04'))) {
            throw new TransportError('could not complete raw paste', data);
        }
    }

    async execRawNoFollow(command: string | Buffer) {
        const commandBytes = (typeof command === 'string') ? Buffer.from(command, 'utf8') : command;

        let data = await this.readUntil(1, Buffer.from('>'));
        if (!data.slice(-1).equals(Buffer.from('>'))) {
            throw new TransportError('could not enter raw repl', data);
        }

        if (this.useRawPaste) {
            this.serial.write('\x05A\x01');
            data = await this.serial.read(2);
            if (data.equals(Buffer.from('R\x00'))) {
                // Device understood raw-paste command but doesn't support it
            } else if (data.equals(Buffer.from('R\x01'))) {
                return await this.rawPasteWrite(commandBytes);
            } else {
                data = await this.readUntil(1, Buffer.from('w REPL; CTRL-B to exit\r\n>'));
                if (!data.slice(-23).equals(Buffer.from('w REPL; CTRL-B to exit\r\n>'))) {
                    throw new TransportError('could not enter raw repl', data);
                }
            }
            this.useRawPaste = false;
        }

        for (let i = 0; i < commandBytes.length; i += 256) {
            this.serial.write(commandBytes.slice(i, i + 256));
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.serial.write('\x04');

        data = await this.serial.read(2);
        if (!data.equals(Buffer.from('OK'))) {
            throw new TransportError('could not exec command', data);
        }
    }

    async execRaw(command: string | Buffer, timeout: number = 10, dataConsumer?: (data: Buffer) => void): Promise<[Buffer, Buffer]> {
        await this.execRawNoFollow(command);
        return this.follow(timeout, dataConsumer);
    }

    async eval(expression: string, parse: boolean = false): Promise<any> {
        if (parse) {
            const ret = await this.exec(`print(repr(${expression}))`);
            return JSON.parse(ret.toString().trim());
        } else {
            const ret = await this.exec(`print(${expression})`);
            return ret.toString().trim();
        }
    }

    async exec(command: string | Buffer, dataConsumer?: (data: Buffer) => void): Promise<Buffer> {
        const [ret, retErr] = await this.execRaw(command, 10, dataConsumer);
        if (retErr.length > 0) {
            throw new TransportError('exception', retErr);
        }
        return ret;
    }

    async execFile(filename: string): Promise<Buffer> {
        const fileData = await fs.promises.readFile(filename);
        return this.exec(fileData);
    }
}
