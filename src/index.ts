interface ITimers {
  TTL?: number,
  maxRequest?: number,
}

interface ITimersFinal {
  TTL: number,
  maxRequest: number,
}

export class Memory {
  private storage: {
    [key: string]: {
      requestCounter: number,
      value: any
      timeoutId: NodeJS.Timeout,
      maxRequest: number,
    }
  } = {}
  private totalRequests: number = 10
  private TTL: number = 10 * 60 * 1000

  constructor(totalRequests?: number, TTL?: number) {
    if (totalRequests || totalRequests === 0) {
      this.totalRequests = totalRequests
    }

    if (TTL || TTL === 0) {
      this.TTL = TTL * 60 * 1000
    }
  }
  public setItem(key: string, value: any, timers?: ITimers) {
    const timersFinal = this.getTimers(timers)
    const timeoutId = this.createTimeout(key, timersFinal.TTL)
    this.storage[key] = {
      requestCounter: 0,
      value,
      timeoutId,
      maxRequest: timersFinal.maxRequest,
    }
    return true
  }

  public getItem(key: string) {
    if (!this.storage[key]) {
      return undefined
    }

    this.storage[key].requestCounter += 1
    const item = this.storage[key]
    if (item.requestCounter >= this.storage[key].maxRequest) {
      this.removeItem(key)
    }

    return item.value
  }

  public hasItem(key: string) {
    if (!this.storage[key]) {
      return false
    }
    return true
  }

  public resetItemCounter(key: string, timers?: ITimers) {
    if (!this.storage[key]) {
      return false
    }

    const timersFinal = this.getTimers(timers)

    clearTimeout(this.storage[key].timeoutId)
    this.storage[key].requestCounter = 0
    this.storage[key].maxRequest = timersFinal.maxRequest
    this.storage[key].timeoutId = this.createTimeout(key, timersFinal.TTL)
    return true
  }

  public removeItem(key: string) {
    if (this.storage[key]) {
      clearTimeout(this.storage[key].timeoutId)
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

  private getTimers(timers?: ITimers) {
    const result: ITimersFinal = {
      TTL: this.TTL,
      maxRequest: this.totalRequests,
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

const memory = new Memory()

export default memory
