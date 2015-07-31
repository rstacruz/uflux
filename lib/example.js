var uflux = window.uflux
var Store = uflux.Store
var Dispatcher = uflux.Dispatcher
var connectToStores = uflux.connectToStores

var App = new Dispatcher()
var ListStore = new Store(App, {}, {
  'list:fetch': function (state) {
    this.storePromise(getList(), 'list:fetch:result')
  },

  'list:fetch:result': function (state, result) {
    return result
  }
})

ListStore.extend({
  storePromise: function (promise, event) {
    promise
    .then((data) => {
      this.dispatcher.emit(event, { status: 'success', data: data })
    })
    .catch((err) => {
      this.dispatcher.emit(event, { status: 'error', error: err })
    })
    this.dispatcher.emit(event, { status: 'pending' })
  }
})

var ListView = React.createClass({
  statics: {
    getStores () { return [ListStore] }
  },

  refresh () {
    App.emit('list:fetch')  
  },

  render () {
    return <div>
      <button onClick={this.refresh}>Reload</button>
      { this.props.status === 'pending' ? (
        <div>Loading...</div>
      ) :
      this.props.status === 'success' ? (
        <div>Result: {JSON.stringify(this.props.data)}</div>
      ) :
      this.props.status === 'error' ? (
        <div>Err: {JSON.stringify(this.props.error)}</div>
      ) : null }
    </div>
  }

})

ListView = connectToStores(ListView)

React.render(<ListView />, document.body)

function getList () {
  return new Promise(function (ok, fail) {
    setTimeout(function () {
      ok([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Cherry' }
      ])
    }, 500)
  })
}
