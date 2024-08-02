/**
 * (c) 2024, Manob Biswas, growcube@https://gitlab.com/growcube, and Bitsflow:bit Educational Foundation
 *
 * SPDX-License-Identifier: MIT
 */
export class Logger {
    private readonly module: String;
  
    constructor(context: String) {
      this.module = context;
    }
  
    protected formatMessage(message: String): String {
      return `[${this.module}] ${message}`;
    }
  
    debug(message: String, ...data: any[]): void {
      if (data.length > 0) {      
        console.groupCollapsed(this.formatMessage(message));
        console.debug(...data);
        console.groupEnd();      
      } else {
        console.debug(this.formatMessage(message));
      }
    }
  
    info(message: String, ...data: any[]): void {
      if (data.length > 0) {
        console.groupCollapsed(this.formatMessage(message));
        console.info(...data);
        console.groupEnd();
      } else {
        console.info(this.formatMessage(message));
      }    
    }
    
    warn(message: String, ...data: any[]): void {
      if (data.length > 0) {
        console.groupCollapsed(this.formatMessage(message));
        console.warn(...data);
        console.groupEnd();
      } else {
        console.warn(this.formatMessage(message));
      }    
    }
    
    error(message: String, ...data: any[]): void {
      if (data.length > 0) {
        console.groupCollapsed(this.formatMessage(message));
        console.error(...data);
        console.groupEnd();
      } else {
        console.error(this.formatMessage(message));
      }    
    }
    
    log(message: String, ...data: any[]): void {
      if (data.length > 0) {
          console.groupCollapsed(this.formatMessage(message));
          console.log(...data);
          console.groupEnd();
      } else {
          console.log(this.formatMessage(message));
      }
    }
  }
  
  export default Logger;
  