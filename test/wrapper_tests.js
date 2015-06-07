var assert = require("assert")

var wrapper = require("../components/wrapper.js")
describe('Wrapper', function(){
    describe('#require', function(){
        it('should return an exported teemserver wrapper', function(){
            assert.equal(typeof(wrapper), 'function')
        })
    })
});