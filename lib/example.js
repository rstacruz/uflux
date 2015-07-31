import React from 'react'
import { Store, Dispatcher, connectToStores } from '../dist/index'

const App = new Dispatcher()

const ListStore = new Store(App, {}, {
  'list:fetch': (state) => {
    this.storePromise(getList(), 'list:fetch:result')
  },

  'list:fetch:result': (state, result) => {
    return result
  }
})

ListStore.extend({
  storePromise (promise, event) {
    promise
      .then((data) => { this.dispatcher.emit(event, { status: 'success', data: data }) })
      .catch((err) => { this.dispatcher.emit(event, { status: 'error', error: err }) })
    this.dispatcher.emit(event, { status: 'pending' })
  }
})

let ListView = React.createClass({
  statics: {
    getStores () { return [ListStore] }
  },

  refresh () {
    App.emit('list:fetch')  
  },

  render () {
    <div>
      <button onclick={this.refresh} />
      (this.props.status === 'pending' ? (
        <div>Loading...</div>
      ) : null)
      (this.props.status === 'success' ? (
        <h3>Items</h3>
        <div>{JSON.stringify(this.props.data)}</div>
      ) : null)
      (this.props.status === 'error' ? (
        <h3>Error</h3>
        <div>{JSON.stringify(this.props.error)}</div>
      ) : null)
    </div>
  }

})

ListView = connectToStores(ListView)

// React.renderDOM(<ListView />, document.body)

function getList () {
  return new Promise(function (ok, fail) {
    setTimeout(function () {
      ok([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Cherry' }
      ])
    })
  })
}
