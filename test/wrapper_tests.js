var assert = require("assert");
var path = require("path");
var fs = require('fs');

var wrapper = require("../components/wrapper.js");
describe('Wrapper', function(){
    describe('#require', function(){
        it('should return an exported teemserver wrapper', function(){
            assert.equal(typeof(wrapper), 'function')
        })
    });

    var handler = wrapper(path.resolve("./test/") + "/", path.resolve("./test/") + "/");

    describe('#wrapper()', function(){
        var statusCode, headers, response, req, redirect;

        beforeEach(function(){
            statusCode = headers = response = redirect = 'unset';
            req = {};
        });

        describe('with invalid path', function() {
            it('should return 404', function(done) {
                req.path = "notfound";

                handler(req, {
                    writeHead : function(sc, h) {
                        assert.equal(404, sc);
                        assert.deepEqual({"Content-Type": 'text/plain'}, h);
                    },
                    end : function(resp) {
                        assert.equal("'notfound' not found", resp)
                        done();
                    }
                });

            })
        });

        describe('with xhr', function(){
            beforeEach(function(){
                req.xhr = true
            });

            it('should return the raw content of the file', function(done) {
                req.path = "test.dre";
                handler(req, {
                    writeHead : function(sc, h) {
                        assert.equal(200, sc);
                        assert.deepEqual({"Content-Type": 'text/html'}, h);
                    },
                    end : function(resp) {
                        assert.equal('<view id="testview" name="test"></view>', resp);
                        done();
                    }
                });
            })
        });

        describe('no xhr', function(){
            beforeEach(function(){
                req.xhr = false;
            });

            describe('when internal/core class', function(){
                it('should redirect to documentation', function(done) {
                    req.path = "/classes/test.dre";
                    handler(req, {
                        redirect: function(url) {
                            assert.equal('/docs/api/#!/api/dr.test', url);
                            done();
                        }
                    });
                })
            });

            it('should return wrapped content', function(done) {
                req.path = "test.dre";
                handler(req, {
                    writeHead : function(sc, h) {
                        assert.equal(200, sc);
                        assert.deepEqual({"Content-Type": 'text/html'}, h);
                    },
                    end : function(resp) {
                        fs.readFile(path.resolve('./wrapper.html'), 'utf8', function (wrapreaderr, template) {
                            assert.equal(template.replace('~[CONTENT]~', '<view id="testview" name="test"></view>'), resp);
                            done();
                        });
                    }
                });
            })
        });
    })
});