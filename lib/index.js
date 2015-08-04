import { EventEmitter } from 'events'
let React

if (global.React) {
  React = global.React
} else {
  React = require('react')
}

let ids = {
  storeInstance: 0,
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
   * on : on(event: string, callback())
   * Listens to an event.
   * See [EventEmitter.on](http://devdocs.io/iojs/events#events_emitter_on_event_listener).
   */

  /**
   * off : off(event: string, callback)
   * Unbinds an event listener.
   * See [EventEmitter.removeListener](http://devdocs.io/iojs/events#events_emitter_removelistener_event_listener).
   */

  off (event, ...args) {
    this.removeListener(event, ...args)
  },

  /**
   * emit : emit(event: string, [...args])
   * Fires an event.
   * See [EventEmitter.emit](http://devdocs.io/iojs/events#events_emitter_emit_event_listener).
   */

  emit (event: String, ...args) {
    try {
      this.emitDepth++
      return EventEmitter.prototype.emit.call(this, event, ...args)
    } finally {
      this.emitDepth--
      if (this.emitDepth === 0) this.runDeferred()
    }
  },

  /**
   * emitAfter : emitAfter(event: string, [...args])
   * Emits an event after the current event stack has finished. If ran outside
   * an event handler, the event will be triggered immediately instead.
   *
   *     dispatcher.on('tweets:load', function () {
   *       dispatcher.emitAfter('tweets:refresh')
   *       // 1
   *     })
   *
   *     dispatcher.on('tweets:refresh', function () {
   *       // 2
   *     })
   *
   *     // in this case, `2` will run before `1`
   */

  emitAfter (event, ...args) {
    if (this.isEmitting()) {
      return this.defer(() => this.emit(event, ...args))
    } else {
      return this.emit(event, ...args)
    }
  },

  /**
   * defer : defer([key: string], callback())
   * Runs something after emitting. If `key` is specified, it will ensure that
   * there will only be one function for that key to be called.
   *
   *     store.defer(function () {
   *       // this will be called after emissions are complete
   *     })
   */

  defer (callback) {
    if (this.isEmitting()) {
      if (!this._defer) this._defer = []
      return this._defer.push(callback)
    } else {
      return callback.call(this)
    }
  },

  /*
   * Private: runs the defer hooks. Done after an emit()
   */

  runDeferred () {
    var list = this._defer
    if (!list) return
    delete this._defer
    list.forEach((callback) => { callback.call(this) })
  },

  /**
   * isEmitting : isEmitting()
   * Returns `true` if the event emitter is in the middle of emitting an event.
   */

  isEmitting () {
    return this.emitDepth > 0
  }
}

/**
 * Store : new Store(dispatcher: Dispatcher, state, actions: Object)
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
      this.id = 'store' + ids.storeInstance++
      this.bindActions()
    }
  }
  NewStore.prototype.state = state
  NewStore.prototype.actionsList = [actions]
  return new NewStore(dispatcher)
}

Store.prototype = {
  ...EventEmitter.prototype,

  /**
   * id : id: String
   * A unique string ID for the instance.
   *
   *     store.id //=> 's43'
   */

  /*
   * Private: unpacks the old observed things.
   */

  bindActions () {
    this.actionsList.forEach((actions) => {
      this.observe(actions, { record: false })
    })
  },

  /**
   * dispatcher : dispatcher: String
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
   * listen : listen(callback(state), [{ immediate }])
   * Listens for changes, firing the function `callback` when it happens. The
   * current state is passed onto the callback as the argument `state`.
   *
   *     store.listen(function (state) {
   *       console.log('State changed:', state)
   *     })
   *
   * The callback will be immediately invoked when you call `listen()`. To
   * disable this behavior, pass `{ immediate: false }`.
   *
   *     store.listen(function (state) {
   *       // ...
   *     }, { immediate: false })
   */

  listen (fn, options) {
    this.on('change', fn)
    if (!options || options.immediate) fn(this.getState())
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
    return this.removeListener('change', fn)
  },

  /**
   * observe : observe(actions: Object, [options: Object])
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

  /*
   * Private: binds actions object `actions` to a `dispatcher`.
   */

  bindToDispatcher (actions, dispatcher) {
    Object.keys(actions).forEach((key) => {
      const fn = actions[key]
      dispatcher.on(key, (...args) => {
        const result = fn.apply(this, [ this.getState(), ...args ])
        if (result) this.resetState(result)
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

  extend (proto: Object) {
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

  dup (dispatcher: Dispatcher) {
    const NewStore = this.constructor
    return new NewStore(dispatcher)
  },

  /**
   * Resets the state to the new given `state`. This should never be used
   * except perhaps in unit tests.
   *
   *     store.resetState({ count: 0 })
   */

  resetState (state: Object) {
    this.state = state
    this.dirty = true

    // Use defer twice to make sure it's at the end of all stacks
    this.dispatcher.defer(() => {
      this.dispatcher.defer(() => {
        if (this.dirty) {
          delete this.dirty
          this.emit('change', state)
        }
      })
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
      const stores = Spec.getStores(this.props, this.context)
      stores.forEach((store) => {
        store.unlisten(this.onChange)
      })
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
