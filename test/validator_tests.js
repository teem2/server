var assert = require("assert");
var path = require("path");
var fs = require('fs');

var validator = require("../components/validator.js");
describe('Validator', function() {
    describe('#require', function() {
        it('should return an exported teemserver validator', function(){
            assert.equal(typeof(validator), 'function')
        })
    });

    var handler = validator(path.resolve("./test/testprojects/") + "/", path.resolve("./test/") + "/");

    describe('#validator()', function() {
        describe('when exists', function() {
            describe('in projects special directroy', function() {
                it("returns correct validation results", function(done) {
                    handler({ query: { url: "/projects/proj.dre"} }, {
                        writeHead : function(sc, h) {
                            assert.equal(200, sc);
                            assert.deepEqual({"Content-Type": 'application/json'}, h);
                        },
                        end : function(resp) {
                            assert.equal('[]', resp);
                            done();
                        }
                    });
                });
            });
            it("returns validation results", function(done) {
                handler({ query: { url: "/test.dre"} }, {
                    writeHead : function(sc, h) {
                        assert.equal(200, sc);
                        assert.deepEqual({"Content-Type": 'application/json'}, h);
                    },
                    end : function(resp) {
                        assert.equal('[]', resp);
                        done();
                    }
                });
            });
        });
        describe('when not exists', function() {
            it("returns 404", function(done) {
                handler({ query: { url: "/notfound"} }, {
                    writeHead : function(sc, h) {
                        assert.equal(404, sc);
                        assert.deepEqual({"Content-Type": 'text/plain'}, h);
                    },
                    end : function(resp) {
                        assert.ok(resp.match(/notfound not found$/));
                        done();
                    }
                });
            });
        });
    });

});