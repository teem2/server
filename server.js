/*
 The MIT License (MIT)

 Copyright ( c ) 2014-2015 Teem2 LLC

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
var path = require('path');
http.globalAgent.maxSockets = 25;
var express = require('express');
var app = express();
var fs = require('fs');

var compress = require('compression')
app.use(compress());

var components = {};
var privateComponents = {};

var componentsFiles = fs.readdirSync("./components")
for (var i = 0, len = componentsFiles.length; i < len; i++) {
  var fileName = componentsFiles[i];
  var component = require("./components/" + fileName);
  components[fileName.replace('.js', '')] = component;
  console.log('Loading Component: ', fileName.replace('.js', ''));
}

var server,
  dreemroot = path.normalize(__dirname + "/" + process.env.DREEM_ROOT),
  projectsroot,
  assembler = components['assembler'],
//  apiProxy = components['apiproxy'],
  validator = components['validator'],
  watchfile = components['watchfile'],
  smokerun = components['smokerun'],
  saucerun = components['saucerun'],
  streem = components['streem'],
  version = components['version'];

console.log('serving Dreem from', dreemroot);
if (process.env.DREEM_PROJECTS_ROOT) {
  projectsroot = path.normalize(__dirname + "/" + process.env.DREEM_PROJECTS_ROOT);
  console.log('serving project root from', projectsroot);
}

if (process.env.DREEM_COMPONENTS_ROOT) {
  componentsroot = path.normalize(__dirname + "/" + process.env.DREEM_COMPONENTS_ROOT);

  if (!fs.existsSync(componentsroot)) {
    console.warn('DREEM_COMPONENTS_ROOT dir not found, no components loaded.');
    return;
  }
  console.log('Loading private components from', componentsroot);
  
  var componentDirs = fs.readdirSync(componentsroot)
  for (var i = 0, len = componentDirs.length; i < len; i++) {
    var dirName = componentDirs[i];
    
    var componentDir = componentsroot + '/' + dirName;
    var componentDescriptorPath = componentDir + '/package.json'
    var componentMainPath = componentDir + '/index.js'
    
    if (!fs.existsSync(componentDescriptorPath)) {
      console.warn('Could not load component from directory', dirName, 'because no package.json found.');
      continue;
    }
    
    if (!fs.existsSync(componentMainPath)) {
      console.warn('Could not load component from directory', dirName, 'because no index.js found.');
      continue;
    }
      
    var component = require(componentMainPath);
    if (!component.initialize) {
      console.warn('Could not load component from directory', dirName, 'because no initialize method found.');
      continue;
    }

    var pjson = require(componentDescriptorPath);
    console.log('Loading component', pjson.name);
    privateComponents[pjson.name] = {"component":component, "component_dir":componentDir};
  }
}

// Start:Routing
app.use(function(req, res, next) {
  if (req.url.match(/^\/(css|js|img|font|api)\/.+/)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  next();
});
if (assembler) app.all('/core/*', assembler(projectsroot, dreemroot, 'core' + path.sep));
app.use(express.static(dreemroot));

if (projectsroot) app.use('/projects', express.static(projectsroot));
if (validator) app.get(/^\/(validate).+/, validator(projectsroot, dreemroot));
if (watchfile) app.get(/^\/(watchfile).+/, watchfile(projectsroot, dreemroot));
if (smokerun) {
  app.get(/^\/smokerun.*/, smokerun.get(projectsroot, dreemroot));
  app.post(/^\/smokerun.*/, smokerun.post(projectsroot, dreemroot));
}
if (saucerun) app.get(/^\/saucerun.*/, saucerun.get(projectsroot, dreemroot));
if (version) app.get(/^\/(version)/, version());
// End:Routing

for (var compName in privateComponents) {
  var comp = privateComponents[compName];
  var expressComp = comp['component'];
  
//  init the server component
  expressComp.initialize(app);

//  Now find all of the .dre files and serve them under the /classes/ path
  var glob = require("glob");
  var dres = glob.sync(comp['component_dir'] + '/dre/' + "**/*.dre");

  for (var i=0; i<dres.length; i++) {
    var dreemFilePath = dres[i];
    
    var ext = '.dre';
    if (dreemFilePath.indexOf(ext, dreemFilePath.length - ext.length) == -1) continue; //skip non-dre files
    
    var dreemFileName = dreemFilePath.substring(dreemFilePath.lastIndexOf('/')+1, dreemFilePath.length);

    var nameParts = compName.split('-');
    if (nameParts[nameParts.length-1] == dreemFileName.replace('.dre', '')) {
      nameParts.pop();
    }
    nameParts.push(dreemFileName);
    
    app.use('/classes/' + nameParts.join('/'), express.static(dreemFilePath))
  }
}

server = http.createServer(app);
if (streem) streem.startServer(server);

//var vfs = require('vfs-local')({
//   root: dreemroot,
//   httpRoot: root,
//});
//app.use(require('vfs-http-adapter')("/fs/", vfs));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});
