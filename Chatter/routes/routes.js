/***************
 *             *    
 *  routings   *
 *             *
 ***************/

var router = require('express').Router();
var responder = require('../lib/responder');

router.get('/', function(req, res, next) {
    responder.homePage(req, res, next);   
});

router.get('/login', function(req, res, next){
    responder.loginPage(req, res, next);
});
router.post('/login', function(req, res, next){
    responder.login(req, res, next);
});

router.get('/logout', function(req, res, next){
    responder.logout(req, res, next);
});
router.get('/chatlist',function(req, res, next){
    responder.chatListPage(req, res, next);
});

router.get('/addchat', function(req, res, next){
    responder.addChatPage(req, res, next);
});
router.post('/addchat', function(req, res, next){
    responder.addChat(req, res, next);
});

router.post('/checkusername', function(req, res, next) {
    responder.checkUserName(req, res, next); 
});

router.get('/chat/:roomID', function(req, res, next) {
    responder.chatRoomPage(req, res, next);
});

router.post('/addmessage', function(req, res, next){
    responder.addMessage(req, res, next);
});

module.exports = router;
