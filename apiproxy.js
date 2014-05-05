'use strict';

var proxy = require('http-proxy').createProxy();
var querystring = require('querystring');
var roviSig = require('./node_modules/rovi/lib/sig.js')

module.exports = function (pattern, target, host, port) {
  return function(req, res, next) {
    var url = req.url;
    if (url.match(pattern)) {
      // strip off leading path
      var newpath = url.replace(pattern, '/');
      // strip off query string
      newpath = newpath.replace(/\?.*/, '');

      // rewrite query parameters with ROVI signature
      req.query.sig = roviSig(process.env.ROVI_SEARCH_KEY, process.env.ROVI_SEARCH_SECRET);
      req.query.apikey = process.env.ROVI_SEARCH_KEY;
      req.query.format = 'json'
      req.url = newpath + '?' + querystring.stringify(req.query);

      console.log('proxying', url, req.url);

      proxy.web(req, res, {
        target: 'http://api.rovicorp.com',
        headers: {
          port: 80,
          host: 'api.rovicorp.com'
        }
      });
    } else {
      next();
    }
  }
};
