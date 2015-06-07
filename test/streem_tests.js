var assert = require("assert")

var streem = require("../components/streem.js")
describe('Streem', function(){
    describe('#require', function(){
        it('should return an exported teemserver streem component', function(){
            assert.equal(typeof(streem), 'function')
        })
    })
});