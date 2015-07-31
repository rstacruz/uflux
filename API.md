## Dispatcher

> `Dispatcher()`

Dispatcher.

### wait

> `wait(fn)`

Queues up event emissions.

## Store

> `Store(dispatcher, state, actions)`

A store is an object that keeps a state and listens to dispatcher events.
Create a new store using `new Store(dispatcher, initialState, handlers)`.

Each handler is a pure function that takes in the `state` and returns the new
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
        getStores () { return [store] }
      }
    })

    Component = connectToStores(Component)

Based on the [alt implementation](https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js).

