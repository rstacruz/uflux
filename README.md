fluxm
=====

Extremely minimalistic flux-like implementation. Inspired by alt, flummox, redux, and the rest of them.

* No actions
* No constants
* Store works with immutable
* Stor

### Require

```js
import { Dispatcher, Store } from 'flux-m'
```

### Dispatcher

```js
const App = new Dispatcher()

App.on('eventname', function () { ... })
App.emit('eventname')
App.emit('eventname', arg1, arg2)
```

### Store

```js
const ListStore = new Store(App,
{
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

No actions, just emit directly on your main dispatcher.

```js
App.emit('list:add')
```

### React

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
