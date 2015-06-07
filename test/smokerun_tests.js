var assert = require("assert")

var smokerun = require("../components/smokerun.js");
describe('Smokerun', function(){
    describe('#require', function(){
        it('should return an exported teemserver smokerun component', function(){
            assert.equal(typeof(smokerun), 'object');
            assert.deepEqual(['get', 'post'], Object.keys(smokerun).sort());
        })
    })
});