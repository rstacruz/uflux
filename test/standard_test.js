/* global describe, it */
describe('coding style', function () {
  it('conforms to standard', require('mocha-standard').files([
    'lib/index.js',
    'test/**/*.js'
  ], {
    parser: 'babel-eslint'
  }))
})
