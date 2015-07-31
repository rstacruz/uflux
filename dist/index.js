(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.uflux = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.Dispatcher = Dispatcher;
exports.Store = Store;
exports.connectToStores = connectToStores;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

if (global.React) {
  React = global.React;
} else {
  React = require('react');
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

function Dispatcher() {}

Dispatcher.prototype = _extends({}, _events.EventEmitter.prototype, {

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

  wait: function wait(fn) {
    var _this = this;

    var emit = this.emit;
    var queue = [];
    try {
      this.emit = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        queue.push(args);
      };
      fn.call(this);
    } finally {
      queue.forEach(function (args) {
        emit.apply(_this, args);
      });
      this.emit = emit;
    }
  }
});

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

function Store(dispatcher, state, actions) {
  // Subclass `Store` and instanciate it.
  var NewStore = (function (_Store) {
    _inherits(NewStore, _Store);

    function NewStore(dispatcher) {
      _classCallCheck(this, NewStore);

      _get(Object.getPrototypeOf(NewStore.prototype), 'constructor', this).call(this);
      this.dispatcher = dispatcher;
      this.bindActions();
    }

    return NewStore;
  })(Store);
  NewStore.prototype.state = state;
  NewStore.prototype.actionsList = [actions];
  return new NewStore(dispatcher);
}

Store.prototype = _extends({}, _events.EventEmitter.prototype, {

  /**
   * Private: unpacks the old observed things
   */

  bindActions: function bindActions() {
    var _this2 = this;

    this.actionsList.forEach(function (actions) {
      _this2.observe(actions, { record: false });
    });
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

  getState: function getState() {
    return this.state;
  },

  /**
   * Listens for changes, firing the function `fn` when it happens.
   *
   *     store.listen(function (state) {
   *       console.log('State changed:', state)
   *     })
   */

  listen: function listen(fn) {
    return this.on('change', fn);
  },

  /**
   * Unbinds a given change handler.
   *
   *     function onChange () { ... }
   *
   *     store.listen(onChange)
   *     store.unlisten(onChange)
   */

  unlisten: function unlisten(fn) {
    return this.off('change', fn);
  },

  /**
   * Listens to events in the dispatcher.
   *
   *     store.observe({
   *       'list:add': function (state) { ... },
   *       'list:remove': function (state) { ... }
   *     })
   */

  observe: function observe(actions, options) {
    this.bindToDispatcher(actions, this.dispatcher);

    // Add the observers to actionsList
    if (!options || options.record) {
      this.actionsList.push(actions);
    }
  },

  /**
   * Private: binds actions object `actions` to a `dispatcher`.
   */

  bindToDispatcher: function bindToDispatcher(actions, dispatcher) {
    var _this3 = this;

    Object.keys(actions).forEach(function (key) {
      var fn = actions[key];
      dispatcher.on(key, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        dispatcher.wait(function () {
          var result = fn.apply(_this3, [_this3.getState()].concat(args));
          if (result) _this3.resetState(result);
        });
      });
    });
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

  extend: function extend(proto) {
    var _this4 = this;

    Object.keys(proto).forEach(function (key) {
      _this4.constructor.prototype[key] = proto[key];
    });
    return this;
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

  dup: function dup(dispatcher) {
    var NewStore = this.constructor;
    return new NewStore(dispatcher);
  },

  /**
   * Resets the state to the new given `state`. This should never be used
   * except perhaps in unit tests.
   *
   *     store.resetState({ count: 0 })
   */

  resetState: function resetState(state) {
    this.state = state;
    this.emit('change', state);
  }
});

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

function connectToStores(Spec) {
  var Component = arguments.length <= 1 || arguments[1] === undefined ? Spec : arguments[1];
  return (function () {
    if (!Spec.getStores) {
      throw new Error('connectToStores(): ' + 'expected getStores() static function');
    }

    if (!Spec.getPropsFromStores) {
      Spec.getPropsFromStores = function () {
        return Spec.getStores().reduce(function (output, store) {
          return _extends({}, output, store.getState());
        }, {});
      };
    }

    var StoreConnection = React.createClass({
      displayName: 'StoreConnection',

      getInitialState: function getInitialState() {
        return Spec.getPropsFromStores(this.props, this.context);
      },

      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState(Spec.getPropsFromStores(nextProps, this.context));
      },

      componentDidMount: function componentDidMount() {
        var _this5 = this;

        var stores = Spec.getStores(this.props, this.context);
        this.storeListeners = stores.map(function (store) {
          return store.listen(_this5.onChange);
        });
        if (Spec.componentDidConnect) {
          Spec.componentDidConnect(this.props, this.context);
        }
      },

      componentWillUnmount: function componentWillUnmount() {
        this.storeListeners.forEach(function (unlisten) {
          return unlisten();
        });
      },

      onChange: function onChange() {
        this.setState(Spec.getPropsFromStores(this.props, this.context));
      },

      render: function render() {
        return React.createElement(Component, _extends({}, this.props, this.state));
      }
    });

    return StoreConnection;
  })();
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":2,"react":undefined}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1])(1)
});