/* global describe, it, expect */
import { Dispatcher, Store, connectToStores } from '../lib'
import React from 'react'
let d, s, el, str, div

describe('React', function () {
  require('mocha-jsdom')()

  beforeEach(function () {
    div = document.createElement('div')
  })

  it('works', function () {
    d = new Dispatcher()

    s = new Store(d, { name: 'John' }, {
      'name:set': function (state, name) {
        return { ...state, name: name }
      }
    })

    let View = React.createClass({
      statics: {
        getPropsFromStores () {
          return s.getState()
        },

        getStores () {
          return [s]
        },
      },

      render () {
        return <div>hi {this.props.name}</div>
      }
    })

    View = connectToStores(View)

    React.render(<View />, div)
    expect(div.textContent).toInclude('hi John')
    d.emit('name:set', 'Jane')
    expect(div.textContent).toInclude('hi Jane')
  })
})
