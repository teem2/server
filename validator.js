'use strict';
var exec = require('child_process').exec;

var skipErrors = ['parser error : StartTag: invalid element name', 'parser error : xmlParseEntityRef: no name', "parser error : EntityRef: expecting ';'"];
var findErrors = function (parsererror) {
  var skip = false
  skipErrors.forEach(function(skiperror) {
    if (parsererror.indexOf(skiperror) > -1) {
      skip = true;
      return;
    }
  })
  return skip
}

var validate;
if (process.platform.indexOf('win32') >= 0) {
  validate = function (path, resultsCallback) {
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
} else {
  validate = function (path, resultsCallback) {
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
}

module.exports = function (projectsroot, dreemroot) {
  return function(req, res, next) {
    var path = req.query.url.substring(1);
    // handle project and root paths
    if (path.indexOf('projects/') === 0){
      path = projectsroot + path.substring(9);
    } else {
      path = dreemroot + path;
    }

    if (path.lastIndexOf('/') === path.length - 1)
      path += 'index.html';

    var sendresults = function(results) {
      // console.log(results);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    }

    validate(path, sendresults)
  }
}
