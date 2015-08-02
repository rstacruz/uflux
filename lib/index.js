import { EventEmitter } from 'events'
let React

if (global.React) {
  React = global.React
} else {
  React = require('react')
}

let ids = {
  store: 0,
  callback: 0
}

/**
 * Dispatcher : new Dispatcher()
 * (Class) An event emitter used to dispatch application events.
 *
 *     app = new Dispatcher()
 *
 *     app.on('build:finish', function (duration) {
 *       console.log('build finished, took ' + duration + 'ms')
 *     })
 *
 *     app.emit('build:finish', 384)
 */

export function Dispatcher () {
  this.emitDepth = 0
}

Dispatcher.prototype = {
  ...EventEmitter.prototype,

  /**
   * on : on(event, callback)
   * Listens to an event.
   * See [EventEmitter.on](http://devdocs.io/iojs/events#events_emitter_on_event_listener).
   */

  /**
   * off : off(event, callback)
   * Unbinds an event listener.
   * See [EventEmitter.off](http://devdocs.io/iojs/events#events_emitter_off_event_listener).
   */

  /**
   * emit : emit(event, [...args])
   * Fires an event.
   * See [EventEmitter.emit](http://devdocs.io/iojs/events#events_emitter_emit_event_listener).
   */

  emit (event, ...args) {
    return this.emitWrap(() => {
      return EventEmitter.prototype.emit.call(this, event, ...args)
    })
  },

  /**
   * Private: calls `fn` taking emitDepth into account.
   */

  emitWrap (fn) {
    try {
      this.emitDepth++
      return fn.call(this)
    } finally {
      this.emitDepth--
      if (this.emitDepth === 0) this.runAfterEmit()
    }
  },

  /**
   * afterEmit : afterEmit([key], callback())
   * Runs something after emitting. If `key` is specified, it will ensure that
   * there will only be one function for that key to be called.
   *
   *     store.afterEmit(function () {
   *       // this will be called after emissions are complete
   *     })
   */

  afterEmit (key = null, callback) {
    if (!this._afterEmit) this._afterEmit = {}
    if (!key) key = '' + ids.callback++
    this._afterEmit[key] = callback
  },

  /*
   * Private: runs the afterEmit hooks. Done after an emit()
   */

  runAfterEmit () {
    if (!this._afterEmit) return
    Object.keys(this._afterEmit).forEach((key) => {
      let callback = this._afterEmit[key]
      callback.call(this)
    })

    delete this._afterEmit
  },

  /**
   * isEmitting : isEmitting()
   * Returns `true` if the event emitter is in the middle of emitting an event.
   */

  isEmitting () {
    return this.emitDepth > 0
  },

  /**
   * Queues up event emissions.
   */

  wait (fn) {
    let emit = this.emit
    let queue = []
    try {
      this.emit = (...args) => {
        return this.emitWrap(() => { queue.push(args) })
      }
      fn.call(this)
    } finally {
      queue.forEach((args) => {
        EventEmitter.prototype.emit.call(this, ...args)
      })
      this.emit = emit
    }
  }
}

/**
 * Store : new Store(dispatcher, state, actions)
 * (Class) A store is an object that keeps a state and listens to dispatcher events.
 *
 * Each action handler is a pure function that takes in the `state` and returns the new
 * state—no mutation should be done here.
 *
 *     let store = new Store(dispatcher, {
 *     }, {
 *       'item:fetch': (state) => {
 *         getItem()
 *           .then((data) => { this.dispatcher.emit('item:fetch:load', { state: 'data', data: data }) })
 *           .catch((err) => { this.dispatcher.emit('item:fetch:load', { state: 'error', error: err }) })
 *         dispatcher.emit('item:fetch:load', { state: 'pending' })
 *
 *         promisify(getItem(), this.dispatcher, 'item:fetch:load')
 *       },
 *
 *       'item:fetch:load': (state, result) => {
 *         return { ...state, ...result }
 *       }
 *     })
 */

export function Store (dispatcher, state, actions) {
  // Subclass `Store` and instanciate it.
  const NewStore = class NewStore extends Store {
    constructor (dispatcher) {
      super()
      this.dispatcher = dispatcher
      this.bindActions()
    }
  }
  NewStore.prototype.state = state
  NewStore.prototype.actionsList = [actions]
  NewStore.prototype.name = 'Store' + ids.store++
  return new NewStore(dispatcher)
}

Store.prototype = {
  ...EventEmitter.prototype,

  /**
   * Private: unpacks the old observed things
   */

  bindActions () {
    this.actionsList.forEach((actions) => {
      this.observe(actions, { record: false })
    })
  },

  /**
   * dispatcher:
   * A reference to the dispatcher.
   *
   *     {
   *       'list:add': (state) => {
   *         this.dispatcher.emit('list:add:error', 'Not allowed')
   *       }
   *     }
   */

  /**
   * Returns the current state of the store.
   *
   *     store.getState()
   */

  getState () {
    return this.state
  },

  /**
   * Listens for changes, firing the function `fn` when it happens.
   *
   *     store.listen(function (state) {
   *       console.log('State changed:', state)
   *     })
   */

  listen (fn) {
    return this.on('change', fn)
  },

  /**
   * Unbinds a given change handler.
   *
   *     function onChange () { ... }
   *
   *     store.listen(onChange)
   *     store.unlisten(onChange)
   */

  unlisten (fn) {
    return this.off('change', fn)
  },

  /**
   * Listens to events in the dispatcher.
   *
   *     store.observe({
   *       'list:add': function (state) { ... },
   *       'list:remove': function (state) { ... }
   *     })
   */

  observe (actions, options) {
    this.bindToDispatcher(actions, this.dispatcher)

    // Add the observers to actionsList
    if (!options || options.record) {
      this.actionsList.push(actions)
    }
  },

  /**
   * Private: binds actions object `actions` to a `dispatcher`.
   */

  bindToDispatcher (actions, dispatcher) {
    Object.keys(actions).forEach((key) => {
      const fn = actions[key]
      dispatcher.on(key, (...args) => {
        dispatcher.wait(() => {
          const result = fn.apply(this, [ this.getState(), ...args ])
          if (result) this.resetState(result)
        })
      })
    })
  },

  /**
   * Adds methods to the store object.
   *
   *     let store = new Store(...)
   *     store.extend({
   *       helperMethod () {
   *         return true
   *       }
   *     })
   *
   *     store.helperMethod() //=> true
   */

  extend (proto) {
    Object.keys(proto).forEach((key) => {
      this.constructor.prototype[key] = proto[key]
    })
    return this
  },

  /**
   * Duplicates the store, listening to a new dispatcher. Great for unit
   * testing.
   *
   *     let store = new Store(...)
   *
   *     let dispatcher = new Dispatcher()
   *     let newStore = store.dup(dispatcher)
   *
   *     dispatch.emit('event')
   *     // ...will only be received by newStore
   */

  dup (dispatcher) {
    const NewStore = this.constructor
    return new NewStore(dispatcher)
  },

  /**
   * Resets the state to the new given `state`. This should never be used
   * except perhaps in unit tests.
   *
   *     store.resetState({ count: 0 })
   */

  resetState (state) {
    this.state = state
    this.dispatcher.afterEmit(this.constructor.name, () => {
      this.emit('change', state)
    })
  }
}

/**
 * Utilities:
 * (Module) Some helper functions.
 */

/**
 * Connects a React Component to a store. It makes the store's state available as properties.
 *
 * It takes the static function `getStores()` and connects to those stores. You
 * may also provide a `getPropsFromStores()` method.
 *
 *     let Component = React.createClass({
 *       statics: {
 *         getStores () { return [store] },
 *         getPropsFromStores (stores) { return stores[0].data }
 *       }
 *     })
 *
 *     Component = connectToStores(Component)
 *
 * Based on the [alt implementation](https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js).
 */

export function connectToStores (Spec, Component = Spec) {
  if (!Spec.getStores) {
    throw new Error('connectToStores(): ' +
      'expected getStores() static function')
  }

  if (!Spec.getPropsFromStores) {
    Spec.getPropsFromStores = function () {
      return Spec.getStores().reduce((output, store) => {
        return { ...output, ...store.getState() }
      }, {})
    }
  }

  const StoreConnection = React.createClass({
    getInitialState () {
      return Spec.getPropsFromStores(this.props, this.context)
    },

    componentWillReceiveProps (nextProps) {
      this.setState(Spec.getPropsFromStores(nextProps, this.context))
    },

    componentDidMount () {
      const stores = Spec.getStores(this.props, this.context)
      this.storeListeners = stores.map((store) => {
        return store.listen(this.onChange)
      })
      if (Spec.componentDidConnect) {
        Spec.componentDidConnect(this.props, this.context)
      }
    },

    componentWillUnmount () {
      this.storeListeners.forEach(unlisten => unlisten())
    },

    onChange () {
      this.setState(Spec.getPropsFromStores(this.props, this.context))
    },

    render () {
      return React.createElement(
        Component,
        { ...this.props, ...this.state }
      )
    }
  })

  return StoreConnection
}
