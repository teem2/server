var assert = require("assert");

var teemserver = require("../server.js");

describe('Server', function(){
    describe('#require', function(){
        it('should return a teemserver with default components', function(){
            var comps = Object.keys(teemserver.components);
            assert.equal(8, comps.length);
            assert.deepEqual(['assembler', 'validator','watchfile','smokerun', 'saucerun', 'streem', 'info', 'wrapper'].sort(), comps.sort())
        });
    })
});