var http = require('http');
var express = require('express');
var async = require('async');
var Primus = require('primus.io')
var compress = require('compression')

var app = express();
var server = http.createServer(app);

app.use(compress());

var apiProxy = require('./apiproxy.js')
app.use(apiProxy(new RegExp('^\/api\/')));

var staticroot = __dirname + '/' + process.env.DREEM_ROOT
console.log('serving static root from', staticroot)
app.use(express.static(staticroot));

app.use(function (req, res, next) {
    if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
	    res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    next();
});

var primus = new Primus(server, { transformer: 'SockJS'});
var state;
primus.on('connection', function (spark) {
	if (state) {
		primus.send('message', state)
	}

	spark.on('message', function (msg) {
		state = msg;
		if (process.env.DEBUG) {
			console.log('message', state);
		}
		primus.send('message', state);
	});
})

// var vfs = require('vfs-local')({
//   root: staticroot,
//   httpRoot: root,
// });

// app.use(require('vfs-http-adapter')("/fs/", vfs));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
