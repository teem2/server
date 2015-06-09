var assert = require("assert");

var watchfile = require("../components/watchfile.js");
describe('Watchfile', function(){
    describe('#require', function(){
        it('should return an exported teemserver watchfile component', function(){
            assert.equal(typeof(watchfile), 'function')
        })
    })

});