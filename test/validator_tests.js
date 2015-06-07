var assert = require("assert")

var validator = require("../components/validator.js")
describe('Validator', function(){
    describe('#require', function(){
        it('should return an exported teemserver validator', function(){
            assert.equal(typeof(validator), 'function')
        })
    })
});