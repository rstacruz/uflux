import { EventEmitter } from 'events'
import React from 'react'

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
   * emit : emit(event, [args...])
   * Fires an event.
   * See [EventEmitter.emit](http://devdocs.io/iojs/events#events_emitter_emit_event_listener).
   */

  /**
   * Queues up event emissions.
   */

  wait (fn) {
    let emit = this.emit
    let queue = []
    try {
      this.emit = (...args) => { queue.push(args) }
      fn.call(this)
    } finally {
      queue.forEach((args) => { emit.apply(this, args) })
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
 *           .then((data) => { dispatcher.emit('item:fetch:load', { state: 'data', data: data }) })
 *           .catch((err) => { dispatcher.emit('item:fetch:load', { state: 'error', error: err }) })
 *         dispatcher.emit('item:fetch:load', { state: 'pending' })
 *       },
 *
 *       'item:fetch:load': (state, result) => {
 *         return { ...state, ...result }
 *       }
 *     })
 */

export function Store (dispatcher, state, actions) {
  this.dispatcher = dispatcher
  if (arguments.length === 3) {
    this.state = state
    this.observe(actions)
  } else if (arguments.length === 2) {
    actions = state
    this.state = {}
    this.observe(actions)
  }
}

Store.prototype = {
  ...EventEmitter.prototype,

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

  observe (actions) {
    this.bindToDispatcher(actions, this.dispatcher)
  },

  /**
   * Private: binds actions object `actions` to a `dispatcher`.
   */

  bindToDispatcher (actions, dispatcher) {
    Object.keys(actions).forEach((key) => {
      const fn = actions[key]
      dispatcher.on(key, (...args) => {
        dispatcher.wait(() => {
          const result = fn(this.getState(), ...args)
          if (result) this.resetState(result)
        })
      })
    })
  },

  /**
   * Resets the state to the new given `state`. This should almost never be
   * used except perhaps in unit tests.
   *
   *     store.resetState({ count: 0 })
   */

  resetState (state) {
    this.state = state
    this.emit('change', state)
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
