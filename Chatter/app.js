var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


//http server and io
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

//set view engine
app.set('view engine', 'ejs');


////use login session
//session config
app.use(session({
    secret: 'asdfqwerASDFQWER',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //3 hour cookie
        maxAge: 1000 * 60 * 60 * 3
    }
}));
//session init
app.use(function(req, res, next) {
    //if login session exists
    if(req.session.loggedIn){
        //save session info as locals
        res.locals.loggedIn = req.session.loggedIn;  
        res.locals.userID = req.session.userID;
        res.locals.userName = req.session.userName;
    } 
    else{
        res.locals.loggedIn = null;
        res.locals.userID = null;
        res.locals.userName = null;
    } 
    next();
});

////static directory path assign
app.use(express.static(__dirname+'/public'));

//routing
app.use(require(__dirname+'/routes/routes'));


////error handler
app.use(function(err, req, res, next){
    console.log(err);
    res.render( __dirname + '/views/error', {errorNum:err.status});
});

//io on
io.on('connection', function(socket){
    //socket on
    socket.on('chat-message', function(msgContent){
        io.emit('chat-message', msgContent);
    });
});


app.set('port', process.env.PORT);

var server = httpServer.listen(app.get('port'), function(){
    console.log('Express Server listening on port ' + server.address().port);
});