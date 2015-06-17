var assert = require("assert");
var path = require('path');
var fs = require('fs');

var watchfile = require("../components/watchfile.js");
describe('Watchfile', function(){
    describe('#require', function(){
        it('should return an exported teemserver watchfile component', function() {
            assert.equal(typeof(watchfile), 'function')
        })
    });

    var handler = watchfile(path.resolve("./test/") + "/", path.resolve("./test/") + "/");

    describe('#watchfile()', function() {
        it('should wait for the file to be changed before returning', function(done) {
            handler({ query: { url: ["/test.dre"] } }, {
                end : function(resp) {
                    assert.equal('/test.dre', resp);
                    done();
                }
            });

            setTimeout(function() {
                fs.utimesSync(path.resolve("./test/test.dre"), Date.now(), Date.now());
            }, 0);
        })
    })

});