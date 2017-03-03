/************************
 *                      *    
 * responder functions  *
 *                      *
 ************************/

var path = require('path');
var dbHandler = require('./dbHandler');
var io = require('../app.js').io;
var socket = require('../app.js').socket;

exports.homePage = function(req, res, next){
    //if already logined
    if(req.session.loggedIn) res.redirect('/chatlist');
    else res.redirect('/login');
};
exports.loginPage = function(req, res, next){
    //if already logined
    if(req.session.loggedIn) res.redirect('/chatlist');
    else res.sendFile(path.resolve(__dirname+'/../views/login.html'));
};
exports.login = function(req, res, next){
    //if already logined
    if(req.session.loggedIn) res.redirect('/chatlist');
    
    else
    dbHandler.login(req.body.name, req.body.password, function(error, loginSuccess, userID){
        if(error) return next(error);
        
        //login success
        if(loginSuccess){
            //save session  
            req.session.loggedIn = true;
            req.session.userID =userID
            req.session.userName = req.body.name;
            res.redirect('/chatlist');
        }
        //fail
        else res.redirect('/login');
    });
};
exports.logout = function(req, res, next){
    req.session.destroy(function(error){
        if(error) return next(error);
        res.redirect('/');
    });
};

exports.chatListPage = function(req, res, next){
    if(req.session.loggedIn){
    
        dbHandler.getChatList(req.session.userID, function(error, roomsInfo){
            if (error) return next(error);
            
            //render ejs page with rooms' information
            res.render('../views/chatlist',{roomsInfo: roomsInfo});
        });
    }
    else res.redirect('/login');
};

exports.addChatPage = function (req, res, next){
    if(req.session.loggedIn) res.render('../views/addchat');
    else res.redirect('/');
};
exports.checkUserName = function(req, res, next){
    dbHandler.checkUserExist(req.body.userName, function(error, exist, userID){
        if(error) return next(error);
        res.json({exist:exist, userID:userID});
    });
};

exports.addChat = function (req, res, next){
    dbHandler.addChat(req.body.roomName, req.body.selectedUserIDs,function(error){
        if(error) return next(error);
    });
};


exports.chatRoomPage = function(req, res, next){
    //check if loggedin user have auth to room
    dbHandler.checkAuthToRoom(res.locals.userID, req.params.roomID, function(error, hasAuth, roomName){
        if(error) return next(error);
    
        //if no room for roomID or not a user in the room
        if(!hasAuth) return res.redirect('/');
    
        dbHandler.getLastMessages(req.params.roomID, function(error, lastMessages){
            if(error) return next(error);
            
            res.render('../views/chatroom',{roomID: req.params.roomID, roomName: roomName ,lastMessages:lastMessages});
        });
    });
};

exports.addMessage = function(req, res, next){
    dbHandler.addMessage(req.body.userID, req.body.roomID, req.body.text, function(error){
        if(error) return next(error);
    });
};