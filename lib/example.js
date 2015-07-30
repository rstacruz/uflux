import React from 'react'

const App = new Dispatcher()

const ListStore = new Store(App, {
  'list:load': (state) => {
    getList()
      .then((data) => { App.emit('list:data', data) })
      .catch((err) => { App.emit('list:error', err) })
    return { ...state, list: { state: 'load' } }
  },

  'list:data': (state, data) => {
    return { ...state, list: { state: 'data', data } }
  },

  'list:error': (state, err) => {
    return { ...state, list: { state: 'error', err } }
  }
})

const ListView = React.createClass({
  getInitialProps () {
    ListStore.on('change', this.setState)
    return ListStore.getState()
  },

  refresh () {
    App.emit('list:load')  
  }
})

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

