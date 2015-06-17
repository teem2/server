var fs = require('fs');
var projectsPath = '/projects/';
var classesPath = '/classes/';
var docsPath = '/docs/api/#!/api/dr.';

module.exports = function (projectsRoot, dreemRoot, absPath) {
    return function(req, res) {
        var path = req.path;
        var isXHR = req.xhr;

        if (!isXHR && path.indexOf(classesPath) === 0) {
            return res.redirect(docsPath + path.substring(classesPath.length, path.length - '.dre'.length));
        } else if (absPath) {
          path = absPath;
        } else if (path.indexOf(projectsPath) === 0) {
          path = projectsRoot + path.substring(projectsPath.length);
        } else {
          path = dreemRoot + path;
        }

        while (path.match(/(\.\.|\/\/)/)) {
            path = path.replace(/\/\//g, '/').replace(/\.\./g, '');
        }

        fs.exists(path, function (exists) {
            if (exists) {
                res.writeHead(200, { 'Content-Type': 'text/html' });

                fs.readFile(path, 'utf8', function(readerr, filedata) {
                    if (readerr) { return console.log(readerr); }

                    if (isXHR) {
                        res.end(filedata);
                    } else {
                        fs.readFile(__dirname + '/../wrapper.html', 'utf8', function (wrapreaderr, template) {
                            if (wrapreaderr) { return console.log(wrapreaderr); }
                            res.end(template.replace('~[CONTENT]~', filedata));
                        });
                    }
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end("'" + req.path + "' not found");
            }
        });

    }
};
