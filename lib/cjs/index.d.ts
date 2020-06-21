export interface ITimers {
    TTL?: number;
    maxRequest?: number;
}
export declare class Metle {
    private storage;
    private maxRequest;
    private TTL;
    constructor(timers?: ITimers);
    setItem(key: string, value: any, timers?: ITimers): boolean;
    updateItem(key: string, value: any, timers?: ITimers): boolean;
    getItem(key: string): any;
    hasItem(key: string): boolean;
    resetItemCounter(key: string, timers?: ITimers): boolean;
    removeItem(key: string): boolean;
    private setItemTimeout;
    private internalResetItemCounter;
    private removeItemTimeout;
    private deleteFromMemory;
    private createTimeout;
    private getTimers;
}
declare const metle: Metle;
export default metle;
//# sourceMappingURL=index.d.ts.map