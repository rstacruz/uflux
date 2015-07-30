import { EventEmitter } from 'events'

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
    this.listen(actions)
  } else if (arguments.length === 2) {
    actions = state
    this.state = {}
    this.listen(actions)
  }
}

Store.prototype = {
  ...EventEmitter.prototype,

  getState () {
    return this.state
  },

  listen (actions) {
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
