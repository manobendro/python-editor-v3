/**
 * (c) 2024, Manob Biswas, growcube@https://gitlab.com/growcube, and Bitsflow:bit Educational Foundation
 *
 * SPDX-License-Identifier: MIT
 */
import Logger from "./log";

const logger = new Logger('serial-connection');


class LineBreakTransformer {
    private chunks: string;

    constructor() {
        // A container for holding stream data until a new line.
        this.chunks = "";
    }

    transform(chunk: string, controller: any) {
        // Append new chunks to existing chunks.
        this.chunks += chunk;
        // For each line breaks in chunks, send the parsed lines out.
        const lines = this.chunks.split("\n");
        this.chunks = lines.pop()!;
        lines.forEach((line) => controller.enqueue(line));
    }

    flush(controller: any) {
        // When the stream is closed, flush any remaining chunks out.
        controller.enqueue(this.chunks);
    }
}

type CallbackFunction = (value: string) => void;


export class SerialConnection {
    private port: SerialPort;
    private reader: any;
    public connected: boolean;
    private readonly callback: CallbackFunction;
    private disconnectRequested: boolean;
    private readableStreamClosed: any;
    private readonly readByLine: boolean;
    private bytesRead: number;

    constructor(port: SerialPort, callback: CallbackFunction, readByLine: boolean) {
        this.port = port;
        this.connected = false;
        this.readByLine = readByLine;
        this.callback = callback;
        this.reader = null;
        this.disconnectRequested = false;
        this.bytesRead = 0;
    }

    async open(params: SerialOptions) {
        await this.port.open(params).then(() => {
            this.connected = true;
            this.bytesRead = 0;
            logger.debug("Connected to serial port");
        }).catch((error) => {
            logger.info("Error during connection to serial port", error);
            throw error
        });
    }

    async close(forgetPort: boolean = false) {
        await this.stopLoop(forgetPort);
    }

    public async runLoop() {
        if (this.readByLine) {
            await this.runLoopReadByLine();
        } else {
            await this.runLoopReadByByte();
        }
    }

    public getBytesRead(): number {
        return this.bytesRead;
    }

    private async runLoopReadByLine() {

        const textDecoder = new TextDecoderStream();
        this.readableStreamClosed = this.port.readable!.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.pipeThrough(new TransformStream(new LineBreakTransformer())).getReader();

        while (this.port.readable && !this.disconnectRequested) {
            try {
                // Listen to data coming from the serial port.
                while (true) {
                    const {value, done} = await this.reader.read();
                    if (value) {
                        this.bytesRead += value.length * value.BYTES_PER_ELEMENT;
                        this.callback(value); // call external callback
                    }
                    if (done) {
                        // Allow the serial port to be closed later.
                        this.reader.releaseLock();
                        break;
                    }
                }
            } catch (error) {
                console.log("ERROR", error);
                throw error
            } finally {
                this.reader.releaseLock();
            }
        }
    }

    private async runLoopReadByByte() {
        this.reader = this.port.readable!.getReader();

        while (this.port.readable && !this.disconnectRequested) {
            try {
                // Listen to data coming from the serial port.
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (value) {
                        this.bytesRead += value.length * value.BYTES_PER_ELEMENT;
                        this.callback(value); // call external callback
                    }
                    if (done) {
                        // Allow the serial port to be closed later.
                        this.reader.releaseLock();
                        break;
                    }
                }
            } catch (error) {
                logger.error("Error occurred while running the loop", error);
                throw error
            } finally {
                this.reader.releaseLock();
            }
        }
    }

    public write(data: any){
        logger.debug("Writing data to port", data, this.port)

		if (this.port?.writable == null) {            
            logger.warn("The port is not connected or is not writable");
            return -1;
        }

        const writer = this.port.writable.getWriter();

        writer.write(data);
        writer.releaseLock();
    }

    public async stopLoop(forgetPort: boolean) {
        logger.debug("Stopping the read loop...");

        this.disconnectRequested = true;
        
        await this.reader.cancel();

        // https://stackoverflow.com/questions/71262432/how-can-i-close-a-web-serial-port-that-ive-piped-through-a-transformstream
        if (this.readableStreamClosed) {
            await this.readableStreamClosed.catch((_: any) => { /* Ignore the error */ });
        }
        
        await this.port.close();

        if (forgetPort) {
            this.port.forget();
        }

        logger.debug("Stopped the read loop...");

        this.disconnectRequested = false;
    }
}

export default SerialConnection
