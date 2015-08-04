/* global describe, it, expect, beforeEach, before */
let jsdom = require('mocha-jsdom')
let Dispatcher, Store
let d, s

describe('Dispatcher', function () {
  before(function () {
    let uflux = jsdom.rerequire('../../lib')
    Dispatcher = uflux.Dispatcher
    Store = uflux.Store
  })

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

describe('Dispatcher.emitDepth', function () {
  beforeEach(function () {
    d = new Dispatcher()
  })

  it('emitDepth = 0', function () {
    d.on('one', function () { })
    d.emit('one')
    expect(d.emitDepth).toEqual(0)
  })

  it('emitDepth = 1', function (next) {
    d.on('one', function () {
      expect(d.emitDepth).toEqual(1)
      next()
    })

    d.emit('one')
  })

  it('emitDepth = 2', function (next) {
    d.on('one', () => { d.emit('two') })

    d.on('two', function () {
      expect(d.emitDepth).toEqual(2)
      next()
    })

    d.emit('one')
  })

  it('defer()', function (next) {
    d.defer(function () {
      expect(d.emitDepth).toEqual(0)
      next()
    })

    d.on('one', () => { d.emit('two') })
    d.on('two', () => { })

    d.emit('one')
  })
})

// describe('Dispatcher.wait()', function () {
//   beforeEach(function () {
//     d = new Dispatcher()
//   })

//   it('.wait() yields', function () {
//     var emissions = []
//     d.on('myevent', (msg) => { emissions.push(msg) })
//     d.wait(() => { d.emit('myevent', 2) })
//     expect(emissions).toEqual([2])
//   })

//   it('.wait() works', function () {
//     var emissions = []
//     d.on('myevent', () => {
//       emissions.push(2)
//     })
//     d.wait(() => {
//       d.emit('myevent')
//       emissions.push(1)
//     })
//     expect(emissions).toEqual([1, 2])
//   })
// })

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

  it('emits a change event', function (next) {
    s.listen(function (state) {
      expect(state).toEqual({ name: 'store', ids: [ 1 ]})
      next()
    }, { immediate: false })
    d.emit('list:push', 1)
  })

  it('listen() files immediately', function (next) {
    s.listen(function (state) {
      expect(state).toBeA('object')
      next()
    })
  })

  it('change events are debounced (with 2)', function (next) {
    s.listen(function (state) {
      expect(state).toEqual(2)
      next()
    }, { immediate: false })
    s.observe({
      'one': (state) => { d.emitAfter('two'); return 1 },
      'two': (state) => { return 2 }
    })

    d.emit('one')
  })

  it('change events are debounced (with 3)', function (next) {
    s.listen(function (state) {
      expect(state).toEqual(3)
      next()
    }, { immediate: false })
    s.observe({
      'one': (state) => { d.emitAfter('two'); return 1 },
      'two': (state) => { d.emitAfter('tri'); return 2 },
      'tri': (state) => { return 3 }
    })

    d.emit('one')
  })

  it('waits', function () {
    s.observe({
      '1st-event': function (state) {
        d.emitAfter('2nd-event')
        return { ...state, ids: state.ids.concat([ 1 ]) }
      },

      '2nd-event': function (state) {
        return { ...state, ids: state.ids.concat([ 2 ]) }
      }
    })

    d.emit('1st-event')
    expect(s.getState().ids).toEqual([ 1, 2 ])
  })

  describe('subclass', function () {
    it('has .constructor', function () {
      expect(s.constructor).toBeA('function')
    })
  })

  describe('.extend()', function () {
    it('works', function () {
      s.extend({ hi () { return 'hello' } })
      expect(s.hi()).toEqual('hello')
    })
  })

  describe('.dup()', function () {
    it('works', function () {
      let dd = new Dispatcher()
      let ss = s.dup(dd)

      dd.emit('list:push', 2)

      expect(ss.getState().ids).toEqual([ 2 ])
      expect(s.getState().ids).toEqual([])
    })
  })
})
