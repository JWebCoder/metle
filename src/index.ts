export interface ITimers {
  TTL?: number,
  maxRequest?: number,
}

interface ITimersFinal {
  TTL: number,
  maxRequest: number,
  raw: {
    TTL: number,
    maxRequest: number,
  },
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
  private TTL: number = 10 * 60 * 1000 // 10 minutes

  constructor(timers?: ITimers) {
    if (timers && (timers.maxRequest || timers.maxRequest === 0)) {
      this.maxRequest = timers.maxRequest
    }

    if (timers && (timers.TTL || timers.TTL === 0)) {
      this.TTL = timers.TTL * 60 * 1000
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
      TTL: timersFinal.raw.TTL,
    }

    if (timersFinal.TTL !== 0) {
      timeoutId = this.createTimeout(key, timersFinal.TTL)
      this.storage[key].timeoutId = timeoutId
    }

    return true
  }

  public updateItem(key: string, value: any, timers?: ITimers): boolean {
    if (!this.hasItem(key)) {
      return false
    }

    const item = this.storage[key]

    const finalTimers: ITimers = {
      TTL: item.TTL,
      maxRequest: item.maxRequest,
    }
    if (timers) {
      if (timers.TTL || timers.TTL === 0) {
        finalTimers.TTL = timers.TTL
      }
      if (timers.maxRequest || timers.maxRequest === 0) {
        finalTimers.maxRequest = timers.maxRequest
      }
    }

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

  public resetItemCounter(key: string, timers?: ITimers): boolean {
    if (!this.hasItem(key)) {
      return false
    }

    return this.internalResetItemCounter(key, timers)
  }

  public removeItem(key: string): boolean {
    if (this.hasItem(key)) {
      this.deleteFromMemory(key, this.storage[key].timeoutId)
    }
    return true
  }

  private internalResetItemCounter(key: string, timers?: ITimers): boolean {
    const timersFinal = this.getTimers(timers)
    const item = this.storage[key]
    const timeoutId = item.timeoutId
    if (timeoutId) {
      if (timersFinal.TTL === 0) {
        this.removeItemTimeout(item as IStorageItemWithTimeout)
      } else {
        if (timersFinal.raw.TTL === item.TTL) {
          timeoutId.refresh()
        } else {
          this.removeItemTimeout(item as IStorageItemWithTimeout)
          item.timeoutId = this.createTimeout(key, timersFinal.TTL)
          item.TTL = timersFinal.raw.TTL
        }
      }
    } else {
      if (timersFinal.TTL) {
        item.timeoutId = this.createTimeout(key, timersFinal.TTL)
        item.TTL = timersFinal.raw.TTL
      }
    }
    item.requestCounter = 0
    item.maxRequest = timersFinal.maxRequest
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

  private getTimers(timers?: ITimers): ITimersFinal {
    const result: ITimersFinal = {
      TTL: this.TTL,
      maxRequest: this.maxRequest,
      raw: {
        TTL: this.TTL / 1000 / 60 ,
        maxRequest: this.maxRequest,
      },
    }

    if (!timers) {
      return result
    }

    if (timers.TTL || timers.TTL === 0) {
      result.raw.TTL = timers.TTL
      result.TTL = timers.TTL * 60 * 1000
    }

    if (timers.maxRequest || timers.maxRequest === 0) {
      result.raw.maxRequest = timers.maxRequest
      result.maxRequest = timers.maxRequest
    }

    return result
  }
}

const metle = new Metle()

export default metle
