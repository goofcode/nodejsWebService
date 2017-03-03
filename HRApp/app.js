var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


var publicRoute = require('./routes/public');
var hrRoute = require('./routes/hr');
var managerRoute = require('./routes/manager');


var app = express();

//bodyParser & cookieParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

////use login session
//session config
app.use(session({
    secret: 'asdfqwerASDFQWER',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //1 hour cookie
        maxAge: 1000 * 60 * 60
    }
}));
//session init
app.use(function(req, res, next) {
    //if login session exists
    if(req.session.loggedIn){
        //save session info as locals
        res.locals.loggedIn = req.session.loggedIn;  
        res.locals.email = req.session.email;
        res.locals.loginLevel = req.session.loginLevel;
    } 
    else{
        res.locals.loggedIn = undefined;
        res.locals.email = undefined;
        res.locals.loginLevel = undefined;
    } 
    next();
});


////static directory path assign
app.use(express.static(path.join(__dirname,'/public')));


////view engine setting
app.set('view engine', 'ejs');


////routing
app.use(publicRoute); 
app.use(hrRoute);
app.use(managerRoute);


////error handler
//throwing error if error
app.use(function(req, res, next){
    var error = new Error('Not Found');
    
    error.status = 404;
    next(error);
});


//error handler for service
app.use(function(err, req, res, next){
    console.log(err);
    res.render( __dirname + '/views/error', {errorNum:err.status});
});

module.exports = app;
