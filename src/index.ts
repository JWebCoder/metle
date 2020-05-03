export interface ITimers {
  TTL?: number,
  maxRequest?: number,
}

interface ITimersFinal {
  TTL: number,
  maxRequest: number,
}

interface IStorageItem {
  requestCounter: number,
  value: any
  timeoutId?: NodeJS.Timeout,
  maxRequest: number,
  key: string,
  TTL: number,
}

interface IStorageItemWithTimeout extends IStorageItem {
  timeoutId: NodeJS.Timeout,
}

export class Metle {
  private storage: {
    [key: string]: IStorageItem,
  } = {}
  private maxRequest: number = 10
  private TTL: number = 10 // value in minutes

  constructor(timers?: ITimers) {
    if (timers) {
      if (timers.maxRequest || timers.maxRequest === 0) {
        this.maxRequest = timers.maxRequest
      }

      if (timers.TTL || timers.TTL === 0) {
        this.TTL = timers.TTL
      }
    }
  }
  public setItem(key: string, value: any, timers?: ITimers): boolean {
    const timersFinal = this.getTimers(timers)
    let timeoutId: NodeJS.Timeout
    this.storage[key] = {
      requestCounter: 0,
      value,
      maxRequest: timersFinal.maxRequest,
      key,
      TTL: timersFinal.TTL,
    }

    if (timersFinal.TTL !== 0) {
      timeoutId = this.createTimeout(key, timersFinal.TTL * 60 * 1000)
      this.storage[key].timeoutId = timeoutId
    }

    return true
  }

  public updateItem(key: string, value: any, timers: ITimers = {}): boolean {
    if (!this.hasItem(key)) {
      return false
    }

    const item = this.storage[key]

    const finalTimers = this.getTimers(timers, item)

    this.internalResetItemCounter(key, finalTimers)

    item.value = value

    return true
  }

  public getItem(key: string): any {
    if (!this.hasItem(key)) {
      return undefined
    }

    const item = this.storage[key]
    if (item.maxRequest !== 0) {
      item.requestCounter += 1
      if (item.requestCounter >= item.maxRequest) {
        this.deleteFromMemory(key, item.timeoutId)
      }
    }

    return item.value
  }

  public hasItem(key: string): boolean {
    return !!this.storage[key]
  }

  public resetItemCounter(key: string, timers: ITimers = {}): boolean {
    if (!this.hasItem(key)) {
      return false
    }

    const item = this.storage[key]

    const finalTimers = this.getTimers(timers, item)

    return this.internalResetItemCounter(key, finalTimers)
  }

  public removeItem(key: string): boolean {
    if (this.hasItem(key)) {
      this.deleteFromMemory(key, this.storage[key].timeoutId)
    }
    return true
  }

  private setItemTimeout(item: IStorageItem, newTTL: number) {
    const TTLMinutes = newTTL * 60 * 1000
    const timeoutId = item.timeoutId
    if (timeoutId) {
      if (newTTL === 0) {
        this.removeItemTimeout(item as IStorageItemWithTimeout)
      } else {
        if (newTTL === item.TTL) {
          timeoutId.refresh()
        } else {
          this.removeItemTimeout(item as IStorageItemWithTimeout)
          item.timeoutId = this.createTimeout(item.key, TTLMinutes)
          item.TTL = newTTL
        }
      }
    } else if (newTTL !== 0) {
      item.timeoutId = this.createTimeout(item.key, TTLMinutes)
      item.TTL = newTTL
    }
  }

  private internalResetItemCounter(key: string, timers: ITimersFinal): boolean {
    const item = this.storage[key]
    this.setItemTimeout(item, timers.TTL)
    item.requestCounter = 0
    item.maxRequest = timers.maxRequest
    return true
  }

  private removeItemTimeout(item: IStorageItemWithTimeout) {
    clearTimeout(item.timeoutId)
    item.TTL = 0
    delete item.timeoutId
  }

  private deleteFromMemory(key: string, timeoutId?: NodeJS.Timeout) {
    if (timeoutId) {
      clearTimeout(timeoutId as NodeJS.Timeout)
    }
    delete this.storage[key]
  }

  private createTimeout(key: string, TTL: number): NodeJS.Timeout {
    return setTimeout(
      () => {
        this.removeItem(key)
      },
      TTL
    )
  }

  private getTimers(timers: ITimers = {}, item?: IStorageItem): ITimersFinal {
    const result: ITimersFinal = {
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
    }

    return result
  }
}

const metle = new Metle()

export default metle
