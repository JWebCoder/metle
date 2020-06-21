"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Metle = /** @class */ (function () {
    function Metle(timers) {
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
    Metle.prototype.setItem = function (key, value, timers) {
        var timersFinal = this.getTimers(timers);
        var timeoutId;
        if (timersFinal.TTL !== 0) {
            timeoutId = this.createTimeout(key, timersFinal.TTL * 60 * 1000);
        }
        this.storage.set(key, {
            requestCounter: 0,
            value: value,
            maxRequest: timersFinal.maxRequest,
            key: key,
            TTL: timersFinal.TTL,
        });
        return true;
    };
    Metle.prototype.updateItem = function (key, value, timers) {
        if (timers === void 0) { timers = {}; }
        if (!this.hasItem(key)) {
            return false;
        }
        var item = this.storage.get(key);
        var finalTimers = this.getTimers(timers, item);
        this.internalResetItemCounter(key, finalTimers);
        item.value = value;
        return true;
    };
    Metle.prototype.getItem = function (key) {
        if (!this.hasItem(key)) {
            return undefined;
        }
        var item = this.storage.get(key);
        if (item.maxRequest !== 0) {
            item.requestCounter += 1;
            if (item.requestCounter >= item.maxRequest) {
                this.deleteFromMemory(key, item.timeoutId);
            }
        }
        return item.value;
    };
    Metle.prototype.hasItem = function (key) {
        return !!this.storage.has(key);
    };
    Metle.prototype.resetItemCounter = function (key, timers) {
        if (timers === void 0) { timers = {}; }
        if (!this.hasItem(key)) {
            return false;
        }
        var item = this.storage.get(key);
        var finalTimers = this.getTimers(timers, item);
        return this.internalResetItemCounter(key, finalTimers);
    };
    Metle.prototype.removeItem = function (key) {
        if (this.hasItem(key)) {
            this.deleteFromMemory(key, this.storage.get(key).timeoutId);
        }
        return true;
    };
    Metle.prototype.setItemTimeout = function (item, newTTL) {
        var TTLMinutes = newTTL * 60 * 1000;
        var timeoutId = item.timeoutId;
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
    };
    Metle.prototype.internalResetItemCounter = function (key, timers) {
        var item = this.storage.get(key);
        this.setItemTimeout(item, timers.TTL);
        item.requestCounter = 0;
        item.maxRequest = timers.maxRequest;
        return true;
    };
    Metle.prototype.removeItemTimeout = function (item) {
        clearTimeout(item.timeoutId);
        item.TTL = 0;
        delete item.timeoutId;
    };
    Metle.prototype.deleteFromMemory = function (key, timeoutId) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        this.storage.delete(key);
    };
    Metle.prototype.createTimeout = function (key, TTL) {
        var _this = this;
        return setTimeout(function () {
            _this.removeItem(key);
        }, TTL);
    };
    Metle.prototype.getTimers = function (timers, item) {
        if (timers === void 0) { timers = {}; }
        var result = {
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
    };
    return Metle;
}());
exports.Metle = Metle;
var metle = new Metle();
exports.default = metle;
