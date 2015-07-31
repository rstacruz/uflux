(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.uflux = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.Dispatcher = Dispatcher;
exports.Store = Store;
exports.connectToStores = connectToStores;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _events = require('events');

var _react = require('react');

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

var _react2 = _interopRequireDefault(_react);

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

function Store(dispatcher, state, actions) {
  this.dispatcher = dispatcher;
  if (arguments.length === 3) {
    this.state = state;
    this.observe(actions);
  } else if (arguments.length === 2) {
    actions = state;
    this.state = {};
    this.observe(actions);
  }
}

Store.prototype = _extends({}, _events.EventEmitter.prototype, {

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

  observe: function observe(actions) {
    var _this2 = this;

    Object.keys(actions).forEach(function (key) {
      _this2.dispatcher.on(key, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this2.dispatcher.wait(function () {
          var result = actions[key].apply(actions, [_this2.state].concat(args));
          if (result) {
            _this2.state = result;
            _this2.emit('change', _this2.state);
          }
        });
      });
    });
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
 *         getStores () { return [store] }
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

    var StoreConnection = _react2['default'].createClass({
      displayName: 'StoreConnection',

      getInitialState: function getInitialState() {
        return Spec.getPropsFromStores(this.props, this.context);
      },

      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState(Spec.getPropsFromStores(nextProps, this.context));
      },

      componentDidMount: function componentDidMount() {
        var _this3 = this;

        var stores = Spec.getStores(this.props, this.context);
        this.storeListeners = stores.map(function (store) {
          return store.listen(_this3.onChange);
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
        return _react2['default'].createElement(Component, _extends({}, this.props, this.state));
      }
    });

    return StoreConnection;
  })();
}

},{"events":undefined,"react":undefined}]},{},[1])(1)
});