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
var express = require('express');
var async = require('async');
var Primus = require('primus.io')
var compress = require('compression')
var exec = require('child_process').exec;
var fs = require('fs');
var proxy = require('express-http-proxy');

var app = express();
var server = http.createServer(app);

app.use(compress());

var apiProxy = require('./apiproxy.js')
app.use(apiProxy(new RegExp('^\/api\/')));

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

var dreemroot = __dirname + '/' + process.env.DREEM_ROOT
console.log('serving Dreem from', dreemroot);
app.use(express.static(dreemroot));

if (process.env.DREEM_PROJECTS_ROOT) {
    var projectsroot = __dirname + '/' + process.env.DREEM_PROJECTS_ROOT
    console.log('serving project root from', projectsroot);
    app.use('/projects', express.static(projectsroot));
}

app.use(function (req, res, next) {
    if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    next();
});

var skipErrors = ['parser error : StartTag: invalid element name', 'parser error : xmlParseEntityRef: no name', "parser error : EntityRef: expecting ';'"];
var findErrors = function (parsererror) {
  skip = false
  skipErrors.forEach(function(skiperror) {
    if (parsererror.indexOf(skiperror) > -1) {
      skip = true;
      return;
    }
  })
  return skip
}

var validateXml = function (path, resultsCallback) {
    exec("xmllint " + path, function(error, stdout, stderr) { 
      var array = stderr.toString().split("\n");
      var out = [];
      for (var i = 0; i < array.length; i += 3) {
        if (findErrors(array[i])) {
          // console.log('skipping', array[i])
        } else if (i + 3 < array.length) {
          out = out.concat(array.slice(i, i + 3))
          // console.log('preserving', array.slice(i, i + 3), out)
        }
      }
      resultsCallback(out);
    });
}

var validateXmlWindows = function (path, resultsCallback) {
    exec("xmllint_windows " + path, function(error, stdout, stderr) { 
      var array = stderr.toString().split("\n");
      var out = [];
      for (var i = 0; i < array.length; i ++) {
        out = out.concat(array.slice(i, i + 3))
        // console.log('preserving', array.slice(i, i + 3), out)
      }
      resultsCallback(out);
    });
}

app.get(/^\/(validate).+/, function (req, res, next) {
    var path = req.query.url.substring(1);
    // handle project and root paths
    if (path.indexOf('projects/') === 0){
        path = projectsroot + path.substring(9);
    } else {
        path = dreemroot + path;
    }

    if (path.lastIndexOf('/') === path.length - 1)
        path += 'index.html';

    // console.log('validating path', path)

    var sendresults = function(results) {
        // console.log(results);
        res.writeHead(200, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify(results));
    }

    if (process.platform.indexOf('win32') >= 0) {
        validateXmlWindows(path, sendresults);
    } else {
        validateXml(path, sendresults);
    }
});

var primus = new Primus(server, { transformer: 'SockJS'});
var state;
primus.on('connection', function (spark) {
  if (state) {
    primus.send('message', state);
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
//   root: dreemroot,
//   httpRoot: root,
// });

// app.use(require('vfs-http-adapter')("/fs/", vfs));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
