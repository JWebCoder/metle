export class Metle {
    constructor(timers) {
        this.storage = new Map();
        this.maxRequest = 0;
        this.TTL = 10; // value in minutes
        if (timers) {
            if (timers.maxRequest || timers.maxRequest === 0) {
                this.maxRequest = timers.maxRequest;
            }
            if (timers.TTL || timers.TTL === 0) {
                this.TTL = timers.TTL;
            }
        }
    }
    setItem(key, value, timers) {
        const timersFinal = this.getTimers(timers);
        let timeoutId;
        if (timersFinal.TTL !== 0) {
            timeoutId = this.createTimeout(key, timersFinal.TTL * 60 * 1000);
        }
        this.storage.set(key, {
            requestCounter: 0,
            value,
            maxRequest: timersFinal.maxRequest,
            key,
            TTL: timersFinal.TTL,
        });
        return true;
    }
    updateItem(key, value, timers = {}) {
        if (!this.hasItem(key)) {
            return false;
        }
        const item = this.storage.get(key);
        const finalTimers = this.getTimers(timers, item);
        this.internalResetItemCounter(key, finalTimers);
        item.value = value;
        return true;
    }
    getItem(key) {
        if (!this.hasItem(key)) {
            return undefined;
        }
        const item = this.storage.get(key);
        if (item.maxRequest !== 0) {
            item.requestCounter += 1;
            if (item.requestCounter >= item.maxRequest) {
                this.deleteFromMemory(key, item.timeoutId);
            }
        }
        return item.value;
    }
    hasItem(key) {
        return !!this.storage.has(key);
    }
    resetItemCounter(key, timers = {}) {
        if (!this.hasItem(key)) {
            return false;
        }
        const item = this.storage.get(key);
        const finalTimers = this.getTimers(timers, item);
        return this.internalResetItemCounter(key, finalTimers);
    }
    removeItem(key) {
        if (this.hasItem(key)) {
            this.deleteFromMemory(key, this.storage.get(key).timeoutId);
        }
        return true;
    }
    setItemTimeout(item, newTTL) {
        const TTLMinutes = newTTL * 60 * 1000;
        const timeoutId = item.timeoutId;
        if (timeoutId) {
            this.removeItemTimeout(item);
            if (newTTL === 0) {
                return;
            }
            item.timeoutId = this.createTimeout(item.key, TTLMinutes);
            item.TTL = newTTL;
        }
        else if (newTTL !== 0) {
            item.timeoutId = this.createTimeout(item.key, TTLMinutes);
            item.TTL = newTTL;
        }
    }
    internalResetItemCounter(key, timers) {
        const item = this.storage.get(key);
        this.setItemTimeout(item, timers.TTL);
        item.requestCounter = 0;
        item.maxRequest = timers.maxRequest;
        return true;
    }
    removeItemTimeout(item) {
        clearTimeout(item.timeoutId);
        item.TTL = 0;
        delete item.timeoutId;
    }
    deleteFromMemory(key, timeoutId) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        this.storage.delete(key);
    }
    createTimeout(key, TTL) {
        return setTimeout(() => {
            this.removeItem(key);
        }, TTL);
    }
    getTimers(timers = {}, item) {
        const result = {
            TTL: timers.TTL || timers.TTL === 0
                ? timers.TTL
                : item
                    ? item.TTL
                    : this.TTL,
            maxRequest: timers.maxRequest || timers.maxRequest === 0
                ? timers.maxRequest
                : item
                    ? item.maxRequest
                    : this.maxRequest,
        };
        return result;
    }
}
const metle = new Metle();
export default metle;
