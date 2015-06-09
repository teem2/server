var assert = require("assert")

var saucerun = require("../components/saucerun.js")
describe('Saucerun', function(){
    describe('#require', function(){
        it('should return an exported teemserver saucerun component', function(){
            assert.equal(typeof(saucerun), 'function')
        })
    })
});