(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fluxm = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
 * (Class) Dispatcher.
 */

var _react2 = _interopRequireDefault(_react);

function Dispatcher() {}

Dispatcher.prototype = _extends({}, _events.EventEmitter.prototype, {

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

/*
 * (Class) Store.
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

  getState: function getState() {
    return this.state;
  },

  listen: function listen(fn) {
    return this.on('change', fn);
  },

  unlisten: function unlisten(fn) {
    return this.off('change', fn);
  },

  observe: function observe(actions) {
    var _this2 = this;

    Object.keys(actions).forEach(function (key) {
      _this2.dispatcher.on(key, function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this2.dispatcher.wait(function () {
          _this2.state = actions[key].apply(actions, [_this2.state].concat(args));
          _this2.emit('change', _this2.state);
        });
      });
    });
  }
});

/*
 * Connects to stores
 *
 * Based on https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js
 */

function connectToStores(Spec) {
  var Component = arguments.length <= 1 || arguments[1] === undefined ? Spec : arguments[1];
  return (function () {
    if (!Spec.getPropsFromStores) {
      throw new Error('connectToStores(): ' + 'expected getPropsFromStores() static function');
    }

    if (!Spec.getStores) {
      throw new Error('connectToStores(): ' + 'expected getStores() static function');
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