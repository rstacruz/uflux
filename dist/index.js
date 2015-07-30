(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// ---

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _events = require('events');

App = new Dispatcher();

ListStore = new Store(App, {
  'list:load': function listLoad(state) {
    getList().then(function (data) {
      App.emit('list:data', data);
    })['catch'](function (err) {
      App.emit('list:error', err);
    });
    return _extends({}, state, { list: { state: 'load' } });
  },

  'list:data': function listData(state, data) {
    return _extends({}, state, { list: { state: 'data', data: data } });
  },

  'list:error': function listError(state, err) {
    return _extends({}, state, { list: { state: 'error', err: err } });
  }
});

var ListView = React.createClass({
  displayName: 'ListView',

  getInitialProps: function getInitialProps() {
    ListStore.on('change', this.setState);
    return ListStore.getState();
  },

  refresh: function refresh() {
    App.emit('list:load');
  }
});

React.renderDOM(React.createElement(ListView, null), document.body);

function getList() {
  return new Promise(function (ok, fail) {
    setTimeout(function () {
      ok([{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }, { id: 3, name: 'Cherry' }]);
    });
  });
}

function Dispatcher() {}

Dispatcher.prototype = _extends({}, _events.EventEmitter.prototype);

function Store(dispatcher, actions) {
  this.state = {};
  this.dispatcher = dispatcher;
  this.listen(actions);
}

Store.prototype = {
  getState: function getState() {
    return this.state;
  },

  listen: function listen(actions) {
    var _this = this;

    Object.keys(actions).forEach(function (key) {
      _this.dispatcher.on(key, function () {
        var _actions;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.state = (_actions = _this.actions)[key].apply(_actions, [_this.state].concat(args));
      });
    });
  }
};

},{"events":undefined,"object-assign":undefined}]},{},[1]);
