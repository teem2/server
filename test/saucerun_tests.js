var assert = require("assert");
var path = require("path");

var saucerun = require("../components/saucerun.js");
describe('Saucerun', function(){
    describe('#require', function(){
        it('should return an exported teemserver saucerun component', function(){
            assert.equal(typeof(saucerun), 'function')
        })
    });

    var handler = saucerun(path.resolve("./test/testprojects/") + "/", path.resolve("./test/") + "/");

    describe('#saucerun()', function() {
        it("returns a saucerunner with DYNAMIC_FILES set properly", function(done) {
            handler(null, {
                writeHead: function(sc) {
                  assert.equal(200, sc);
                },
                end: function(resp) {
                  assert.equal('<html>DYNAMIC_FILES = [\"http://localhost:8080/smoke/a.html?test\",\"http://localhost:8080/smoke/b.html?test\"]</html>', resp);
                  done();
                }
            });
        });
    });
});