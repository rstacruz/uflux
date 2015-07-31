## Dispatcher

> `new Dispatcher()`

An event emitter used to dispatch application events.

    app = new Dispatcher()

    app.on('build:finish', function (duration) {
      console.log('build finished, took ' + duration + 'ms')
    })

    app.emit('build:finish', 384)

### on

> `on(event, callback)`

Listens to an event.
See [EventEmitter.on](http://devdocs.io/iojs/events#events_emitter_on_event_listener).

### off

> `off(event, callback)`

Unbinds an event listener.
See [EventEmitter.off](http://devdocs.io/iojs/events#events_emitter_off_event_listener).

### emit

> `emit(event, [args...])`

Fires an event.
See [EventEmitter.emit](http://devdocs.io/iojs/events#events_emitter_emit_event_listener).

### wait

> `wait(fn)`

Queues up event emissions.

## Store

> `new Store(dispatcher, state, actions)`

A store is an object that keeps a state and listens to dispatcher events.

Each action handler is a pure function that takes in the `state` and returns the new
state—no mutation should be done here.

    let store = new Store(dispatcher, {
    }, {
      'item:fetch': (state) => {
        getItem()
          .then((data) => { dispatcher.emit('item:fetch:load', { state: 'data', data: data }) })
          .catch((err) => { dispatcher.emit('item:fetch:load', { state: 'error', error: err }) })
        dispatcher.emit('item:fetch:load', { state: 'pending' })
      },

      'item:fetch:load': (state, result) => {
        return { ...state, ...result }
      }
    })

### getState

> `getState()`

Returns the current state of the store.

    store.getState()

### listen

> `listen(fn)`

Listens for changes, firing the function `fn` when it happens.

    store.listen(function (state) {
      console.log('State changed:', state)
    })

### unlisten

> `unlisten(fn)`

Unbinds a given change handler.

    function onChange () { ... }

    store.listen(onChange)
    store.unlisten(onChange)

### observe

> `observe(actions)`

Listens to events in the dispatcher.

    store.observe({
      'list:add': function (state) { ... },
      'list:remove': function (state) { ... }
    })

## Utilities

Some helper functions.

### connectToStores

> `connectToStores(Spec, Component = Spec)`

Connects a React Component to a store. It makes the store's state available as properties.

It takes the static function `getStores()` and connects to those stores. You
may also provide a `getPropsFromStores()` method.

    let Component = React.createClass({
      statics: {
        getStores () { return [store] },
        getPropsFromStores (stores) { return stores[0].data }
      }
    })

    Component = connectToStores(Component)

Based on the [alt implementation](https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js).

