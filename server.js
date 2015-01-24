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
var fs = require('fs');

//var compress = require('compression')
//app.use(compress());

var components = {};
componentsFiles = fs.readdirSync("./components")
for (var i=0, l=componentsFiles.length; i<l; i++) {
  var fileName = componentsFiles[i];
  var component = require('./components/' + fileName);
  components[fileName.replace('.js', '')] = component;
  console.log('Loading Component: ', fileName.replace('.js', ''));
}

app.use(function (req, res, next) {
  if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  next();
});

var dreemroot = __dirname + '/../dreem/'//process.env.DREEM_ROOT
console.log('serving Dreem from', dreemroot);
app.use(express.static(dreemroot));

var apiProxy = components['apiproxy'];
if (apiProxy) {
  app.use(apiProxy(new RegExp('^\/api\/')));
}

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

var validator = components['validator'];
if (validator) {
  app.get(/^\/(validate).+/, validator(projectsroot, dreemroot));
}

var watchfile = components['watchfile'];
if (watchfile) {
  app.get(/^\/(watchfile).+/, watchfile(projectsroot, dreemroot));
}

var smokerun = components['smokerun'];
if (smokerun) {
  app.get(/^\/smokerun.*/, smokerun.get(projectsroot, dreemroot));
  app.post(/^\/smokerun.*/, smokerun.post(projectsroot, dreemroot));
}

var server = http.createServer(app);

var streem = components['streem'];
if (streem) {
  streem.startServer(server);
}

//var vfs = require('vfs-local')({
//   root: dreemroot,
//   httpRoot: root,
//});
//app.use(require('vfs-http-adapter')("/fs/", vfs));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
