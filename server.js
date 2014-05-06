var http = require('http');
var express = require('express');
var async = require('async');

// var compress = require('compression')

var app = express();
var server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);

// app.use(compress());
var apiProxy = require('./apiproxy.js')
app.use(apiProxy(new RegExp('^\/api\/')));

var staticroot = __dirname + '/' + process.env.DREEM_ROOT
console.log('DREEM_ROOT', staticroot)
app.use(express.static(staticroot));

app.use(function (req, res, next) {
    if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
	    res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    next();
});

// chat server
var state = ''
var sockets = [];

io.on('connection', function (socket) {
    if (state) socket.emit('message', state);

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        state = data;
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
