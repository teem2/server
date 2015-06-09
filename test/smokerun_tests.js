var assert = require("assert");
var path = require("path");
var fs = require("fs");

var smokerun = require("../components/smokerun.js");
describe('Smokerun', function(){
    describe('#require', function(){
        it('should return an exported teemserver smokerun component', function(){
            assert.equal(typeof(smokerun), 'object');
            assert.deepEqual(['get', 'post'], Object.keys(smokerun).sort());
        })
    });

    var getHandler = smokerun.get(path.resolve("./test/") + "/", path.resolve("./test/") + "/");
    describe('#get()', function() {
        it ("handles post data", function(done) {
            var req = {
                on: function(name, value) {
                    this[name] = value;
                }
            };
            var res = {
                writeHead : function(sc, h) {
                    assert.equal(200, sc);
                    assert.deepEqual({"Content-Type": 'text/html'}, h);
                },
                end : function(data) {
                    fs.readFile(path.resolve('./autotester.html'), 'utf8', function (err, template) {
                        assert.equal(template.replace(/\$ALLFILES\$/, '"smoke/a.html","smoke/b.html"'), data);
                        done();
                    });
                }
            };

            getHandler(req, res);
        });
    });

    var postHandler = smokerun.post(path.resolve("./test/") + "/", path.resolve("./test/") + "/");

    describe('#post()', function() {
        it ("handles post data", function(done) {
            var req = {
                on: function(name, value) {
                    this[name] = value;
                }
            };
            var res = {
                writeHead : function(sc, h) {
                    assert.equal(200, sc);
                    assert.deepEqual({"Content-Type": 'text/plain'}, h);
                },
                end : function(data) {
                    assert.equal("   \t \t", data);
                    done();
                }
            };

            postHandler(req, res);

            //using spaces and tabs here so as not to mess up the printout when you run mocha
            //TODO: probably should rewrite the server component someday so that the 'console.log' part can be turned off for the tests.
            req.data("   ");
            req.data("\t \t");

            req.end();
        });
    });

});