var express = require("express");
var app = express();

var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
//var passportLocal = require('passport-local');
//var passportHttp = require('passport-http');

//var User = require('./data/users')();
var User = require('./models/user')();
//console.log(User)

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/myappdatabase');
mongoose.connect('mongodb://cahuser:cahuser@ds023468.mlab.com:23468/cahuserdb');

require('./config/passport')(passport, User);

//var flash = require('connect-flash');

var port = process.env.PORT || 3000;

var cors = require('cors');
app.use(cors());
app.options('/profile', cors());
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));




//app.use(cookieParser())
// app.use(expressSession({
// 	secret: process.env.SESSION_SECRET || 'secret',
// 	// resave: false,
// 	// saveUninitialized: false,
// 	resave: true,
// 	saveUninitialized: true
	
// }))

// app.use(function(req, res, next) {
// 	console.log("Test: ", req.headers.origin)
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//     next();
// });

app.use(passport.initialize());
app.use(passport.session());




var faye = require('faye');

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

require('./routes/routes')(app, passport, User, bayeux);

// [START server]
// Start the server
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  //console.log('App listening at http://%s:%s', host, port);
  console.log('App listening at http://'+host+':'+port);
});
bayeux.attach(server)
// [END server]


