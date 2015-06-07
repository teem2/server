var assert = require("assert")

var info = require("../components/info.js")
describe('Info', function(){
    describe('#require', function(){
        it('should return an exported teemserver info component', function(){
            assert.equal(typeof(info), 'function')
        })
    });
    describe('#info()', function(){
        it('should handle return info request data', function(){
            var statusCode = 'unset', headers = 'unset', response = 'unset';
            var res = {
                writeHead : function(sc, h) {
                    statusCode = sc;
                    headers = h;
                },
                end : function(resp) {
                    response = JSON.parse(resp);
                    response.currentTime = 'SET'
                }
            };
            var handler = info();
            handler(null, res);

            assert.equal(200, statusCode);
            assert.deepEqual({"Content-Type": "application/json"}, headers);
            assert.deepEqual({ currentTime: "SET", "server": "Dreem", "version": "1.0.2"}, response);
        })
    })

});