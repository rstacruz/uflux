uflux
=====

Another implementation for the Flux architecture for React apps that pushes minimalism far.

* Reduced verbosity: no action constants, no action methods. To fire a method, just emit a signal from the disptacher.
* Store works with immutable
* Stor

### Require

```js
import { Dispatcher, Store, connectToStores } from 'uflux'
```

### Dispatcher

A disptacher is simply an [EventEmitter].

```js
const App = new Dispatcher()

App.on('eventname', function () { ... })
App.emit('eventname')
App.emit('eventname', arg1, arg2)
```

[EventEmitter]: http://devdocs.io/iojs/events#events_class_events_eventemitter

### Store

A store is an object that keeps a state and listens to dispatcher events.
Create a new store using `new Store(dispatcher, initialState, handlers)`.

Each handler is a pure function that takes in the `state` and returns the new
state—no mutation should be done here.

```js
const ListStore = new Store(App, {
  items: []
}, {
  'list:add': function (state, item) {
    return {
      ...state,
      items: state.items.concat([ item ])
    }
  }
})

App.emit('list:add', '2')
ListStore.getState() /* { items: [2] } */
```

### Actions

To fire an action, just emit directly on your main dispatcher. No need for action methods.

```js
App.emit('list:add')
```

### React

You can connect a react Component to a store using `connectToStores()`. The
state of the store will be available as properties (`this.props`).

```js
const ListView = React.createClass({
  statics: {
    getStores () {
      return [ ListStore ]
    },
 
    getPropsFromStores() {
      return ListStore.getState()
    }
  },
  render () {
    return <div>hi, {this.props.name}</div>
  }

})

ListView = connectToStores(ListView)
```

## Chaining events

You can emit events inside handlers. They will be fired after committing the new state to the event store.

```js
const ListStore = new Store(App, {
  items: []
}, {
  'list:add': function (state, item) {
    if (state.locked) {
      const err = new Error('List is locked')
      App.emit('list:error', err)
      return { ...state, error: err }
    }
  }
})

App.on('list:error', function (err) {
  console.log(err.message) //=> "List is locked"
  console.log(ListStore.getState().error.message) //=> "List is locked"
})
```

## Disclaimer

This is built as a proof-of-concept and has not been battle-tested in a production setup.
