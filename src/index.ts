export interface ITimers {
  TTL?: number,
  maxRequest?: number,
}

interface ITimersFinal {
  TTL: number,
  maxRequest: number,
}

export class Metle {
  private storage: {
    [key: string]: {
      requestCounter: number,
      value: any
      timeoutId?: NodeJS.Timeout,
      maxRequest: number,
    }
  } = {}
  private maxRequest: number = 10
  private TTL: number = 10 * 60 * 1000

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
    }

    if (timersFinal.TTL !== 0) {
      timeoutId = this.createTimeout(key, timersFinal.TTL)
      this.storage[key].timeoutId = timeoutId
    }

    return true
  }

  public getItem(key: string): any {
    if (!this.storage[key]) {
      return undefined
    }

    this.storage[key].requestCounter += 1
    const item = this.storage[key]
    if (this.storage[key].maxRequest !== 0) {
      if (item.requestCounter >= this.storage[key].maxRequest) {
        this.removeItem(key)
      }
    }

    return item.value
  }

  public hasItem(key: string): boolean {
    if (!this.storage[key]) {
      return false
    }
    return true
  }

  public resetItemCounter(key: string, timers?: ITimers): boolean {
    if (!this.storage[key]) {
      return false
    }

    const timersFinal = this.getTimers(timers)

    if (this.storage[key].timeoutId) {
      clearTimeout(this.storage[key].timeoutId as NodeJS.Timeout)
      delete this.storage[key].timeoutId
    }
    if (timersFinal.TTL !== 0) {
      this.storage[key].timeoutId = this.createTimeout(key, timersFinal.TTL)
    }
    this.storage[key].requestCounter = 0
    this.storage[key].maxRequest = timersFinal.maxRequest
    return true
  }

  public removeItem(key: string): boolean {
    if (this.storage[key]) {
      if (this.storage[key].timeoutId) {
        clearTimeout(this.storage[key].timeoutId as NodeJS.Timeout)
      }
      delete this.storage[key]
    }
    return true
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
    }

    if (!timers) {
      return result
    }

    if (timers.TTL || timers.TTL === 0) {
      result.TTL = timers.TTL * 60 * 1000
    }

    if (timers.maxRequest || timers.maxRequest === 0) {
      result.maxRequest = timers.maxRequest
    }

    return result
  }
}

const metle = new Metle()

export default metle
