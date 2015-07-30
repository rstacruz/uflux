/* global describe, it, expect, beforeEach */
import { Dispatcher, Store } from '../lib'
let d, s

describe('Dispatcher', function () {
  beforeEach(function () {
    d = new Dispatcher()
  })

  it('works', function (next) {
    d.on('myevent', () => next())
    d.emit('myevent')
  })

  it('carries 1 argument', function (next) {
    d.on('myevent', function (name) {
      expect(name).toEqual('world')
      next()
    })
    d.emit('myevent', 'world')
  })

  it('carries multiple arguments', function (next) {
    d.on('greet', function (name, greeting) {
      expect(name).toEqual('world')
      expect(greeting).toEqual('salut')
      next()
    })
    d.emit('greet', 'world', 'salut')
  })
})

describe('Dispatcher.wait()', function () {
  beforeEach(function () {
    d = new Dispatcher()
  })

  it('.wait() yields', function () {
    var emissions = []
    d.on('myevent', (msg) => { emissions.push(msg) })
    d.wait(() => { d.emit('myevent', 2) })
    expect(emissions).toEqual([2])
  })

  it('.wait() works', function () {
    var emissions = []
    d.on('myevent', () => {
      emissions.push(2)
    })
    d.wait(() => {
      d.emit('myevent')
      emissions.push(1)
    })
    expect(emissions).toEqual([1, 2])
  })
})

describe('Store', function () {
  beforeEach(function () {
    d = new Dispatcher()
  })

  beforeEach(function () {
    s = new Store(d, { name: 'store', ids: [] }, {
      'list:push': function (state, id) {
        return { ...state, ids: state.ids.concat([ id ]) }
      }
    })
  })

  it('works', function () {
    d.emit('list:push', 1)
    d.emit('list:push', 2)

    expect(s.getState().name).toEqual('store')
    expect(s.getState().ids).toEqual([ 1, 2 ])
  })

  it('emits a change event', function () {
    s.on('change', function (state) {
      expect(state).toEqual({ name: 'store', ids: [ 1 ]})
    })
    d.emit('list:push', 1)
  })

  it('waits', function () {
    s.listen({
      '1st-event': function (state) {
        d.emit('2nd-event')
        return { ...state, ids: state.ids.concat([ 1 ]) }
      },

      '2nd-event': function (state) {
        return { ...state, ids: state.ids.concat([ 2 ]) }
      }
    })

    d.emit('1st-event')
    expect(s.getState().ids).toEqual([ 1, 2 ])
  })
})
