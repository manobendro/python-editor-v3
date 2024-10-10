/**
 * (c) 2024, Manob Biswas and Bitsflow:bit Educational Foundation
 *
 * SPDX-License-Identifier: MIT
 */
import EventEmitter from "events";
import { ConnectOptions, ConnectionStatus, DeviceConnection, EVENT_FLASH, EVENT_SERIAL_DATA, EVENT_STATUS, FlashDataSource } from "./device";
import SerialTransport from "./serial-transport";

export class BitsflowbitWebSerialConnection extends EventEmitter
    implements DeviceConnection {
    status: ConnectionStatus = ConnectionStatus.NO_AUTHORIZED_DEVICE;
    private flashing: boolean = false;
    private disconnectAfterFlash: boolean = false;
    private serialTransport: SerialTransport | null = null;
    private visibilityReconnect: boolean = false;

    private serialListener = (data: string) => {
        this.emit(EVENT_SERIAL_DATA, data);
    }
    private handleDisconnect = async () => {
        if (this.serialTransport !== null) {
            await this.serialTransport.deInit();
            this.setStatus(ConnectionStatus.NOT_CONNECTED);
        }
    }
    private visibilityChangeListener = () => {
        if (document.visibilityState === "visible") {
            if (
                this.visibilityReconnect &&
                this.status !== ConnectionStatus.CONNECTED
            ) {
                this.disconnectAfterFlash = false;
                this.visibilityReconnect = false;
                if (!this.flashing) {
                    this.log("Reconnecting visible tab");
                    this.connect();
                }
            }
        } else {
            if (this.status === ConnectionStatus.CONNECTED) {
                if (!this.flashing) {
                    this.log("Disconnecting hidden tab");
                    this.disconnect().then(() => {
                        this.visibilityReconnect = true;
                    });
                } else {
                    this.log("Scheduling disconnect of hidden tab for after flash");
                    this.disconnectAfterFlash = true;
                }

            }
        }
    };

    async initialize(): Promise<void> {
        this.log("----initialize----");
        if (navigator.serial) {
            navigator.serial.addEventListener('disconnect', this.handleDisconnect)
        }
        if (typeof window !== 'undefined') {
            // window.addEventListener("beforeunload", this.beforeUnloadListener);
            if (window.document) {
                window.document.addEventListener(
                    "visibilitychange",
                    this.visibilityChangeListener
                );
            }
        }
    }
    dispose(): void {
        this.log("----dispose----");
        if (navigator.serial) {
            navigator.serial.removeEventListener("disconnect", this.handleDisconnect);
        }
        if (typeof window !== "undefined") {
            if (window.document) {
                window.document.removeEventListener(
                    "visibilitychange",
                    this.visibilityChangeListener
                );
            }
        }
    }
    async connect(_?: ConnectOptions | undefined): Promise<ConnectionStatus> {
        this.log("----connect----");
        if (this.status === ConnectionStatus.CONNECTED) return ConnectionStatus.CONNECTED;
        if (this.serialTransport === null) {
            this.serialTransport = new SerialTransport();
        }
        const connected = await this.serialTransport.initSerial();
        if (connected) this.serialTransport.dataConsumerIRQ(this.serialListener); // async but sholud not wait
        this.setStatus(connected ? ConnectionStatus.CONNECTED : ConnectionStatus.NOT_CONNECTED);
        return this.status;
    }
    async flash(dataSource: FlashDataSource, options: { partial: boolean; progress: (percentage: number | undefined, partial: boolean) => void; }): Promise<void> {
        //if disconnectAfterFlash is true then desconnect or relese serial port access
        // TODO: flashing not impliment yet

        if(!this.serialTransport?.connected){
            return;
        }

        // this.log("----flash----");
        this.flashing = true;

        // flashing ....
        // console.log(dataSource);
        // console.log(options);
        // console.log(this.disconnectAfterFlash);
        try {
            // Wait for the promise to resolve
            let fileRecord = await dataSource.files();
            let totalFiles = Object.entries(fileRecord).length;
            let wrote = 0;
            // Iterate over the object using a for...in loop or Object.entries()
            options.progress((wrote / totalFiles) * 100, true);
            for (const [filename, fileData] of Object.entries(fileRecord)) {
                // console.log(`File: ${filename}`);
                // console.log(`Data:`, new TextDecoder().decode(fileData)); // Uint8Array data
                await this.serialTransport?.fsWritefile(filename, fileData);
                wrote++;
                options.progress((wrote / totalFiles) * 100, true);
            }
        } catch (error) {
            console.error("Error processing files:", error);
        }
        // flashing done ....

        this.emit(EVENT_FLASH);
        this.flashing = false;

        setTimeout(() => options.progress(undefined, true), 500);
        //Sending CTRL-C, CTRL-D for softwer reset.
        await this.serialTransport?.write("\r\x03"); //CTRL-C
        await this.serialTransport?.write("\r\x04"); //CTRL-D
        
        if(this.disconnectAfterFlash){
            await this.disconnect();
        }
    }
    async disconnect(): Promise<void> {
        this.log("----disconnect----");
        if (this.serialTransport !== null) {
            this.serialTransport.deInit();
            this.setStatus(ConnectionStatus.NOT_CONNECTED);
        }
    }
    async serialWrite(data: string): Promise<void> {
        this.log("----serialWrite----");
        if (this.serialTransport !== null) {
            await this.serialTransport.write(data);
        }
    }
    async clearDevice(): Promise<void> {
        this.log("----clearDevice----");
        await this.disconnect();
        this.serialTransport = null;
        this.setStatus(ConnectionStatus.NO_AUTHORIZED_DEVICE);
    }
    private setStatus(newStatus: ConnectionStatus) {
        this.status = newStatus;
        this.visibilityReconnect = false;
        // this.log("Device status " + newStatus);
        this.emit(EVENT_STATUS, this.status);
    }
    private log(data: string) {
        console.log(data);
    }

}
//REF: https://gitlab.com/growcube/web-console/-/blob/master/src/repl.ts?ref_type=heads