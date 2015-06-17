var fs = require('fs');
var path = require('path');

module.exports = {
	get: function (projectsroot, dreemroot) {
		return function(req, res) {
			var files = fs.readdirSync( dreemroot + '/smoke');
			var str = '';
			for (var i=0, l=files.length; i<l; i++) {
			  var fileName = files[i];
			  if(fileName.match(/\.html$/i)){
			  	if(str) str += ",";
			  	str += '"smoke/' + fileName + '"'
			  }
			}
            fs.readFile(path.resolve(__dirname + '/../autotester.html'), 'utf8', function (err, template) {
              if (err) { return console.log(err); }
              var out = template.replace(/\$ALLFILES\$/, str);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(out);
            });
		}
	},
	post: function (projectsroot, dreemroot) {
		return function(req, res) {
			var blk = '';
			req.on('data', function(data) {
				blk += data.toString()
			});
			req.on('end', function() {
                //TODO: rewrite so that the 'console.log' part can be turned off or redirected for the tests.
                console.log(blk);
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end(blk)
			});
		}
	}
};
