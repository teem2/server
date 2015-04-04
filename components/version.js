var fs = require('fs');
var ver;
fs.readFile('VERSION', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    ver = data
    console.log('Dreem server version:', ver)
});

module.exports = function () {
    return function(req, res, next) {

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({version: ver}));
    }
}