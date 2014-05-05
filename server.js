var express = require('express');
var apiProxy = require('./apiproxy.js')

var app = express();
app.use(apiProxy(new RegExp('^\/api\/')));

var staticroot = __dirname + '/' + process.env.DREEM_ROOT
console.log('DREEM_ROOT', staticroot)
app.use(express.static(staticroot));

app.listen(8080);
