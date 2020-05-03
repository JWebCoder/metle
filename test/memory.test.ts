import { Metle } from '../lib/index'

const metle = new Metle({maxRequest: 2, TTL: 1})

describe('Metle storage', () => {

  it('Should answer false on hasItem if item not present', () => {
    expect(metle.hasItem('stuff')).toBe(false)
  })

  it('Should answer undefined on getItem if item not present', () => {
    expect(metle.getItem('stuff')).toBe(undefined)
  })

  it('updateItem should update both value and timers', () => {
    expect(metle.setItem('toUpdate', '123', {TTL: 0, maxRequest: 0})).toBe(true)
    expect(metle.getItem('toUpdate')).toBe('123')
    expect(metle.updateItem('toUpdate', '124', {TTL: 10, maxRequest: 1})).toBe(true)
    expect(metle.updateItem('toUpdate', '124', {TTL: 11})).toBe(true)
    expect(metle.updateItem('toUpdate', '124', {TTL: 0, maxRequest: 0})).toBe(true)
    expect(metle.updateItem('toUpdate', '124')).toBe(true)
    expect(metle.updateItem('toUpdate', '124', {TTL: 0})).toBe(true)
    expect(metle.updateItem('toUpdate', '124', {maxRequest: 1})).toBe(true)
    expect(metle.getItem('toUpdate')).toBe('124')
    expect(metle.getItem('toUpdate')).toBe(undefined)
    expect(metle.removeItem('toUpdate')).toBe(true)
  })

  it('updateItem should return false if items doesnt exists', () => {
    expect(metle.updateItem('doNotUpdate', '124', {TTL: 0, maxRequest: 1})).toBe(false)
  })

  it('Should answer true on setItem', () => {
    expect(metle.setItem('stuff', 'cool')).toBe(true)
  })

  it('Should get the item correctly on getItem', () => {
    expect(metle.getItem('stuff')).toBe('cool')
  })

  it('Should answer true on hasItem if item present', () => {
    expect(metle.hasItem('stuff')).toBe(true)
  })

  it('Should answer true on resetItemCount if item present', () => {
    expect(metle.resetItemCounter('stuff')).toBe(true)
    expect(metle.resetItemCounter('stuff', {TTL: 0})).toBe(true)
    expect(metle.resetItemCounter('stuff', {TTL: 1})).toBe(true)
  })

  it('Should answer true on removeItem', () => {
    expect(metle.removeItem('stuff')).toBe(true)
    expect(metle.removeItem('undefined')).toBe(true)
  })

  it('Should answer false on resetItemCount if item not present', () => {
    expect(metle.resetItemCounter('stuff')).toBe(false)
  })

  it('Should remove item after resetCounter is reached', () => {
    metle.setItem('stuff', true, {maxRequest: 2})
    metle.getItem('stuff')
    metle.getItem('stuff')
    const result = metle.hasItem('stuff')
    expect(result).toBe(false)
  })

  it('Item should be remove after TTL', (done) => {
    metle.setItem('test', true, {TTL: 0.001})
    return new Promise(
      (res, rej) => {
        setTimeout(
          () => {
            res(true)
          },
          100
        )
      }
    ).then(
      () => {
        expect(metle.getItem('test')).toBe(undefined)
        done()
      }
    )
  })

  it('Metle instance without TTL and maxRequest', (done) => {
    const metleInfinite = new Metle({TTL: 0, maxRequest: 0})
    metleInfinite.setItem('test', true)
    expect(metleInfinite.getItem('test')).toBe(true)
    expect(metleInfinite.resetItemCounter('test')).toBe(true)
    return new Promise(
      (res, rej) => {
        setTimeout(
          () => {
            res(true)
          },
          1000
        )
      }
    ).then(
      () => {
        expect(metleInfinite.getItem('test')).toBe(true)
        expect(metleInfinite.removeItem('test')).toBe(true)
        expect(metleInfinite.getItem('test')).toBe(undefined)
        done()
      }
    )
  })
})
