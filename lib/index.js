import { EventEmitter } from 'events'

export function Dispatcher () {
}

Dispatcher.prototype = {
  ...EventEmitter.prototype,
  wait (fn) {
    fn()
  }
}

export function Store (dispatcher, actions) {
  this.state = {}
  this.dispatcher = dispatcher
  this.listen(actions)
}

Store.prototype = {
  getState () {
    return this.state
  },

  listen (actions) {
    Object.keys(actions).forEach((key) => {
      this.dispatcher.on(key, (...args) => {
        this.dispatcher.wait(() => {
          this.state = this.actions[key](this.state, ...args)
        })
      })
    })
  }
}
