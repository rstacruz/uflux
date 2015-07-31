/* global describe, it */
describe('coding style', function () {
  this.timeout(5000)
  it('conforms to standard', require('mocha-standard').files([
    'lib/index.js',
    'test/**/*.js'
  ], {
    parser: 'babel-eslint'
  }))
})
