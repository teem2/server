API_VERSION = "1.0.2";

console.log('Dreem server API version:', API_VERSION)

module.exports = function () {
    return function(req, res, next) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({server: 'Dreem', currentTime: new Date(), version: API_VERSION}));
    }
};