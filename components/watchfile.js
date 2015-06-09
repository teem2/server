'use strict';

var fs = require('fs');
var path = require('path');

var responses = [];
var watch = "mtime"; // or use "ctime"
var refreshinterval = 200;
var root = path.resolve(__dirname).toString();
var delta = 0;
var watching = {};
var stats = {};

var watchfile = function (filename, res, path){
  responses.push(res);

  if (watching[filename]) {
    return;
  }

  stats[filename] = fs.statSync(filename)[watch].toString();

  watching[filename] = setInterval(function(){
    fs.stat(filename, function(err, stat) {
      if (stat) {
        if (stat[watch].toString() != stats[filename]) {
          stats[filename] = stat[watch].toString();
          if (Date.now() - delta > 2000) {
            delta = Date.now();
            for (var i = 0; i < responses.length; i++) {
              responses[i].end(path)
            }
            responses = []
          }
        }
      } else if (err) {
        // Sometimes files disappear, like when docs are rebuilt
        // console.log('error', err)

        // stop listening
        clearInterval(watching[filename]);

        // allow listening again
        watching[filename] = false
      }
    });
  }, refreshinterval)
};

module.exports = function (projectsroot, dreemroot) {
  return function(req, res) {
    var urls = req.query.url;
    urls.forEach(function (url) {

      if (url.indexOf('/') !== 0){
        return;
      }

      var path = url.substring(1);

      if (path.indexOf('projects/') === 0){
        path = projectsroot + path.substring(9);
      } else {
        path = dreemroot + path;
      }

      fs.exists(path, function(found) {
        if (!found) {
          // console.log('File not found:' + path)
          // res.writeHead(404)
          res.end("file not found");
          return
        }
        watchfile(path, res, url)
      });
    })
  }
};
