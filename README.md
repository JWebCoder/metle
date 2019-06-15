Metle
======
**Metle** is a memory storage for NodeJS.

## Install
```
npm install metle
```

## Usage

**Load the default Metle instance**
```node
import metle from 'metle'

metle.setItem('foo', 'bar')

const foo = metle.getItem('foo')
```

**Create a new Metle instance**
```node
import { Metle } from 'metle'

const metleInstance = new Metle()
metle.setItem('foo', 'bar')

const foo = metle.getItem('foo')
```

## API

- **getItem**(key: string): any
- **setItem**(key: string, value: any, timers?:ITimers): boolean
- **hasItem**(key: string): boolean
- **resetItemCounter**(key: string, timers?: ITimers): boolean
- **removeItem**(key: string): boolean

**Metle constructor**
```node
  const metle = new Metle(timers?: ITimers)
```

**Interface ITimers**
```node
interface ITimers {
  TTL?: number, // default: 10 (min), maximum time to live of an item, 0 for infinite
  maxRequest?: number, // default: 10, maximum number of gets until the item is removed, 0 for infinite
}
```

## License 
* see [LICENSE](https://github.com/JWebCoder/metle/blob/master/LICENSE) file
