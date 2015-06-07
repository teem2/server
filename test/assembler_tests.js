var assert = require("assert");

var assembler = require("../components/assembler.js");
describe('Server', function(){
    describe('#require', function(){
        it('should return an exported teemserver assembler', function(){
            assert.equal(typeof(assembler), 'function')
        })
    })
});