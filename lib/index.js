import { EventEmitter } from 'events'
import React from 'react'

/**
 * (Class) Dispatcher.
 */

export function Dispatcher () {
}

Dispatcher.prototype = {
  ...EventEmitter.prototype,

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

/*
 * (Class) Store.
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

  getState () {
    return this.state
  },

  listen (fn) {
    return this.on('change', fn)
  },

  unlisten (fn) {
    return this.off('change', fn)
  },

  observe (actions) {
    Object.keys(actions).forEach((key) => {
      this.dispatcher.on(key, (...args) => {
        this.dispatcher.wait(() => {
          this.state = actions[key](this.state, ...args)
          this.emit('change', this.state)
        })
      })
    })
  }
}

/*
 * Connects to stores
 *
 * Based on https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js
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

    componentWillUnmount() {
      this.storeListeners.forEach(unlisten => unlisten())
    },

    onChange() {
      this.setState(Spec.getPropsFromStores(this.props, this.context))
    },

    render() {
      return React.createElement(
        Component,
        { ...this.props, ...this.state }
      )
    }
  })

  return StoreConnection
}
