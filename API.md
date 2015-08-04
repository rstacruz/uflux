## Dispatcher

> `new Dispatcher()`

An event emitter used to dispatch application events.

    app = new Dispatcher()

    app.on('build:finish', function (duration) {
      console.log('build finished, took ' + duration + 'ms')
    })

    app.emit('build:finish', 384)

### on

> `on(event: string, callback())`

Listens to an event.
See [EventEmitter.on](http://devdocs.io/iojs/events#events_emitter_on_event_listener).

### off

> `off(event: string, callback)`

Unbinds an event listener.
See [EventEmitter.removeListener](http://devdocs.io/iojs/events#events_emitter_removelistener_event_listener).

### emit

> `emit(event: string, [...args])`

Fires an event.
See [EventEmitter.emit](http://devdocs.io/iojs/events#events_emitter_emit_event_listener).

### emitAfter

> `emitAfter(event: string, [...args])`

Emits an event after the current event stack has finished. If ran outside
an event handler, the event will be triggered immediately instead.

    dispatcher.on('tweets:load', function () {
      dispatcher.emitAfter('tweets:refresh')
      // 1
    })

    dispatcher.on('tweets:refresh', function () {
      // 2
    })

    // in this case, `2` will run before `1`

### defer

> `defer([key: string], callback())`

Runs something after emitting. If `key` is specified, it will ensure that
there will only be one function for that key to be called.

    store.defer(function () {
      // this will be called after emissions are complete
    })

### isEmitting

> `isEmitting()`

Returns `true` if the event emitter is in the middle of emitting an event.

## Store

> `new Store(dispatcher: Dispatcher, state, actions: Object)`

A store is an object that keeps a state and listens to dispatcher events.

Each action handler is a pure function that takes in the `state` and returns the new
state—no mutation should be done here.

    let store = new Store(dispatcher, {
    }, {
      'item:fetch': (state) => {
        getItem()
          .then((data) => { this.dispatcher.emit('item:fetch:load', { state: 'data', data: data }) })
          .catch((err) => { this.dispatcher.emit('item:fetch:load', { state: 'error', error: err }) })
        dispatcher.emit('item:fetch:load', { state: 'pending' })

        promisify(getItem(), this.dispatcher, 'item:fetch:load')
      },

      'item:fetch:load': (state, result) => {
        return { ...state, ...result }
      }
    })

### id

> `id: String`

A unique string ID for the instance.

    store.id //=> 's43'

### dispatcher

> `dispatcher: String`

A reference to the dispatcher.

    {
      'list:add': (state) => {
        this.dispatcher.emit('list:add:error', 'Not allowed')
      }
    }

### getState

> `getState()`

Returns the current state of the store.

    store.getState()

### listen

> `listen(callback(state), [{ immediate }])`

Listens for changes, firing the function `callback` when it happens. The
current state is passed onto the callback as the argument `state`.

    store.listen(function (state) {
      console.log('State changed:', state)
    })

The callback will be immediately invoked when you call `listen()`. To
disable this behavior, pass `{ immediate: false }`.

    store.listen(function (state) {
      // ...
    }, { immediate: false })

### unlisten

> `unlisten(fn)`

Unbinds a given change handler.

    function onChange () { ... }

    store.listen(onChange)
    store.unlisten(onChange)

### observe

> `observe(actions: Object, [options: Object])`

Listens to events in the dispatcher.

    store.observe({
      'list:add': function (state) { ... },
      'list:remove': function (state) { ... }
    })

### extend

> `extend(proto: Object)`

Adds methods to the store object.

    let store = new Store(...)
    store.extend({
      helperMethod () {
        return true
      }
    })

    store.helperMethod() //=> true

### dup

> `dup(dispatcher: Dispatcher)`

Duplicates the store, listening to a new dispatcher. Great for unit
testing.

    let store = new Store(...)

    let dispatcher = new Dispatcher()
    let newStore = store.dup(dispatcher)

    dispatch.emit('event')
    // ...will only be received by newStore

### resetState

> `resetState(state: Object)`

Resets the state to the new given `state`. This should never be used
except perhaps in unit tests.

    store.resetState({ count: 0 })

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

