/*
 The MIT License (MIT)

 Copyright ( c ) 2014 Teem2 LLC

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/
var http = require('http');
http.globalAgent.maxSockets = 25;
var express = require('express');
var app = express();

var compress = require('compression')
app.use(compress());

app.use(function (req, res, next) {
  if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  next();
});

var dreemroot = __dirname + '/' + process.env.DREEM_ROOT
console.log('serving Dreem from', dreemroot);
app.use(express.static(dreemroot));

var apiProxy = require('./apiproxy.js')
app.use(apiProxy(new RegExp('^\/api\/')));

var proxy = require('express-http-proxy');
app.use('/img/', proxy('cps-static.rovicorp.com', {
  filter: function(req, res) {
     return req.method == 'GET';
  },
  forwardPath: function(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Expires', 'Mon, 25 Jun 2015 21:31:12 GMT');
    return require('url').parse(req.url).path;
  }
}));

if (process.env.DREEM_PROJECTS_ROOT) {
  var projectsroot = __dirname + '/' + process.env.DREEM_PROJECTS_ROOT
  console.log('serving project root from', projectsroot);
  app.use('/projects', express.static(projectsroot));
}

var validator = require('./validator.js')
app.get(/^\/(validate).+/, validator(projectsroot, dreemroot));

var watchfile = require('./watchfile.js')
app.get(/^\/(watchfile).+/, watchfile(projectsroot, dreemroot));

var server = http.createServer(app);

var state;
var defaultroom = 'broadcast';
var devices = {};

var Primus = require('primus.io')
var primus = new Primus(server, { transformer: 'SockJS' });
var UAParser = require('ua-parser-js');
var uaparser = new UAParser();

var getDeviceID = function(req) {
  // console.log('getDeviceID', recentip + '~' + req.headers['user-agent'])
  return recentip + '~' + req.headers['user-agent']
}

var updateDevices = function () {
  var devicelist = [];
  var keys = Object.keys(devices).sort();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    devicelist.push(devices[key]);
  }
  primus.write({type: 'devices', data: devicelist});
}

// grab the remote IP before it disappears in the bowels of primus - key for unregistering
// devices when they disconnect
var recentip = null
primus.before('name', function (req, res) {
  recentip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     (req.socket && req.socket.remoteAddress) ||
     (req.connection.socket && req.connection.socket.remoteAddress);
});

primus.on('connection', function (spark) {
  obj = uaparser.setUA(spark.headers['user-agent']).getResult();
  // console.log(JSON.stringify(devices))
  obj.ip = recentip;
  obj.id = spark.id
  devices[getDeviceID(spark.request)] = obj
  // console.log('device connected', getDeviceID(spark.request))
  updateDevices();

  if (state) {
    primus.write(state);
  }

  // always join the default room
  spark.join(defaultroom);

  spark.on('data', function (data) {
    state = data
    if (process.env.DEBUG) {
      console.log('data', JSON.stringify(data));
    }
    spark.join(defaultroom, function () {
      // send message to all clients except this one
      spark.room(defaultroom).except(spark.id).write(data);
    });
  });
})

primus.on('disconnection', function (spark) {
  delete devices[getDeviceID(spark.request)]
  // console.log('device disconnected', getDeviceID(spark.request))
  updateDevices();
});

// var vfs = require('vfs-local')({
//   root: dreemroot,
//   httpRoot: root,
// });

// app.use(require('vfs-http-adapter')("/fs/", vfs));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
