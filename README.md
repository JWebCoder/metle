#Metle

[![Build Status][travis-badge]][travis]
[![codecov][codecov-badge]][codecov]
[![Language grade: JavaScript][lgtm-badge]][lgtm]
![node][node]
[![npm version][npm-badge]][npm]
[![devDependencies Status][dev-dependencies-badge]][dev-dependencies]
[![PRs Welcome][prs-badge]][prs]
[![GitHub][license-badge]][license]

**Metle** is a memory storage for NodeJS that supports caching with TTL and maximum number of requests to keep the cache up to date.

## Install
```js
npm install metle
```

## Usage

**Load the default Metle instance**
```js
import metle from 'metle'

metle.setItem('foo', 'bar')

const foo = metle.getItem('foo')
```

**Create a new Metle instance**
```js
import { Metle } from 'metle'

const metleInstance = new Metle({TTL: 2, maxRequest: 50})
metle.setItem('foo', 'bar')

const foo = metle.getItem('foo')
```

## API

- **getItem**(key: string): any
- **setItem**(key: string, value: any, timers?:ITimers): boolean
- **updateItem**(key: string, value: any, timers?:ITimers): boolean
- **hasItem**(key: string): boolean
- **resetItemCounter**(key: string, timers?: ITimers): boolean
- **removeItem**(key: string): boolean

**Default timers**
TTL = 10 (minutes value)
maxRequest = 0

**Metle constructor**
```js
  const metle = new Metle(timers?: ITimers)
```

**Interface ITimers**
```js
interface ITimers {
  TTL?: number, // default: 10 (min), maximum time to live of an item, 0 for infinite
  maxRequest?: number, // default: 0, maximum number of gets until the item is removed, 0 for infinite
}
```

[travis-badge]: https://travis-ci.com/JWebCoder/metle.svg?branch=master
[travis]: https://travis-ci.com/JWebCoder/metle

[codecov-badge]: https://codecov.io/gh/JWebCoder/metle/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/JWebCoder/metle

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/JWebCoder/metle.svg?logo=lgtm&logoWidth=18
[lgtm]: https://lgtm.com/projects/g/JWebCoder/metle/context:javascript

[node]: https://img.shields.io/node/v/metle.svg

[npm-badge]: https://badge.fury.io/js/metle.svg
[npm]: https://badge.fury.io/js/metle

[dev-dependencies-badge]: https://david-dm.org/JWebCoder/metle/dev-status.svg
[dev-dependencies]: https://david-dm.org/JWebCoder/metle?type=dev

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[prs]: http://makeapullrequest.com

[license-badge]: https://img.shields.io/github/license/JWebCoder/metle.svg
[license]: https://github.com/JWebCoder/metle/blob/master/LICENSE