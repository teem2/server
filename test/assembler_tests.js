var assert = require("assert");
var path = require("path");

var assembler = require("../components/assembler.js");
describe('Assembler', function(){
    describe('#require', function(){
        it('should return an exported teemserver assembler', function(){
            assert.equal(typeof(assembler), 'function')
        })
    });

    var handler = assembler(path.resolve("./test/testprojects/") + "/", path.resolve("./test/") + "/", "");

    describe('#assembler()', function() {
        it('should assemble a file', function(done) {

            handler({
                query: { cache: 'clear', runtime: 'test' },
                path: '/assembler/unassembled.ujs',
                originalUrl: '',
                runtime: 'test'
            },{
                writeHead: function(sc, h) {
                    assert.equal(200, sc);
                    assert.deepEqual({"Content-Type": 'application/json'}, h);
                },
                end: function(resp) {
                    assert.equal('(function() {  console.log("HERE");}).call(this);', resp.replace(/[\r\n]/g,''));
                    done();
                }
            })
        })
    })
});