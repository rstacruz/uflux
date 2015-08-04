# μflux

**uflux** - Another implementation for the Flux architecture for React apps that pushes minimalism far.

* Store works with immutable objects
* Unidirectional flow

But also:

* Reduced verbosity. no action constants, no action methods. To fire a method, just emit a signal from the disptacher.

See [API.md](API.md) for full API documentation.

[![Status](https://travis-ci.org/rstacruz/uflux.svg?branch=master)](https://travis-ci.org/rstacruz/uflux "See test builds")

## Usage

When used via npm/bower/browserify/webpack/etc:

```js
import { Dispatcher, Store, connectToStores } from 'uflux'
```

### Composition

Your application will be composed of:

* One and only one Dispatcher singleton.
* Many stores (singletons), each listening to the one Dispatcher.
* Many React components, with some listening to changes to one or more stores.

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

It listens to events from the dispatcher and responds by updating the store's state.

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

If you're firing within an event listener (such as in a store), you can use `emitAfter()` to make the event trigger after all other events have triggered.

```js
const DiceStore = new Store(App, { }, {
  'dice:roll': function (state) {
    App.emitAfter('dice:refresh')
    return { number: Math.floor(Math.random() * 6) + 1 }
  }
})
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

### Chaining events

You can emit events inside handlers. They will be fired after committing the new state to the store.

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

### Testing stores

Create unit tests for stores by duplicating it and assigning it to a new dispatcher via `.dup()`.

```js
const ListStore = new Store(...)

const App = new Dispatcher()
const TestListStore = ListStore.dup(App)

App.emit('list:clear')
// ...will only be received by TestListStore, not ListStore.
```

<br>

## API

See [API.md](API.md) for full API documentation.

Unresolved API questions:

 * should we allow naming stores? this'd be a great way to make a global "save state" for your entire app
 * atomicity - is it possible?
 * can/should components listen to dispatch events?
 * is there a better function signature for new Store()?
 * what about stores that need to interact with each other (say AuthenticationStore)?
 * it should be possible to debounce store change events (eg, a chain of dispatch events that modify stores). but how?
 * ...post yours in [issues/](issues/)

<br>

## Extra notes

### Regular usage

> [](#version) `<script src="https://cdn.rawgit.com/rstacruz/uflux/v0.8.0/dist/index.js"></script>`

```js
var Store = window.uflux.Store
var Dispatcher = window.uflux.Dispatcher
var connectToStores = window.uflux.connectToStores
```

### Babel

Using [Babel] is recommended for JSX parsing and enabling ES2015 features.
`--stage 0` is recommended, too, for rest spreading support (`{ ...state, active:
  true }`)—a feature very useful for Stores.

[Babel]: https://babeljs.io

<br>

## Disclaimer

This is built as a proof-of-concept and has not been battle-tested in a production setup.

<br>

## Thanks

**uflux** © 2015+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/uflux/contributors
