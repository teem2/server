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

      var query = req.query;
      // rewrite query parameters with ROVI signature
      query.sig = roviSig(process.env.ROVI_SEARCH_KEY, process.env.ROVI_SEARCH_SECRET);
      query.apikey = process.env.ROVI_SEARCH_KEY;
      query.format = 'json'
      req.url = newpath + '?' + querystring.stringify(query);

      console.log('proxying', url, req.url);

      proxy.on('proxyRes', function (res) {
        // aggro cache, see https://devcenter.heroku.com/articles/increasing-application-performance-with-http-cache-headers
        res.headers['Cache-Control'] = 'public, max-age=31536000';
        res.headers['Expires'] = 'Mon, 25 Jun 2015 21:31:12 GMT';
      });

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
