/* global describe, it, expect, beforeEach, afterEach, before */
let jsdom = require('mocha-jsdom')
let React, Dispatcher, Store, connectToStores
let d, s, div, View, spies

describe('React', function () {
  jsdom()

  before(function () {
    React = jsdom.rerequire('react')
    let uflux = jsdom.rerequire('../../lib')

    Store = uflux.Store
    Dispatcher = uflux.Dispatcher
    connectToStores = uflux.connectToStores
  })

  beforeEach(function () {
    div = document.createElement('div')
  })

  beforeEach(function () {
    d = new Dispatcher()
  })

  beforeEach(function () {
    s = new Store(d, {
      name: 'John'
    }, {
      'name:set': (state, name) => {
        return { ...state, name: name }
      }
    })
  })

  beforeEach(function () {
    View = React.createClass({
      propTypes: {
        name: React.PropTypes.string
      },
      statics: {
        getStores: () => [s]
      },

      render () {
        return <div>hi {this.props.name}</div>
      }
    })

    View = connectToStores(View)
  })

  it('works', function () {
    React.render(<View />, div)
    expect(div.textContent).toInclude('hi John')
  })

  it('responds to changes', function () {
    React.render(<View />, div)
    expect(div.textContent).toInclude('hi John')
    d.emit('name:set', 'Jane')
    expect(div.textContent).toInclude('hi Jane')
  })

  it('can be unmounted', function () {
    spies = [
      expect.spyOn(View.prototype, 'componentDidMount')
    ]

    let NewView = React.createClass({
      getInitialState () {
        return { visible: true }
      },

      render () {
        return (
          <div>{ this.state.visible ? <View /> : null }</div>
        )
      }
    })

    let inst = React.render(<NewView />, div)
    inst.setState({ visible: false })
    expect(View.prototype.componentDidMount).toHaveBeenCalled()
  })

  afterEach(function () {
    if (spies) {
      spies.forEach((spy) => { spy.restore() })
      spies = null
    }
  })
})
