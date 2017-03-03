var express = require('express');
var accDB = require('../lib/accountDB');
var router = express.Router();

//accounts routing
router.get('/accounts',function(req, res, next){
    checkAuth(req, res, function(){
        accDB.getAccounts(function(error, data){
            if(error) return next(error);
            
            var jsonData = JSON.stringify(data);
            res.render('../views/accounts', {accounts: jsonData}); 
        });
    });
});

router.get('/signuprequest',function(req, res, next){
    checkAuth(req, res, function(){
        accDB.getSignupRequest(function(error, data){
            if(error) return next(error);
            
            var jsonData = JSON.stringify(data);
            res.render('../views/signuprequest', {requests: jsonData}); 
        });
    });
});

router.get('/approve/:reqId',function(req, res, next){
    checkAuth(req, res, function(){
        accDB.approveAccount(req.params.reqId, function(error){
            if(error) return next(error);
            
            res.redirect('/signuprequest');
        });
    });
});
router.get('/disapprove/:reqId',function(req, res, next){
    checkAuth(req, res, function(){
        accDB.approveAccount(req.params.reqId, function(error){
            if(error) return next(error);
            
            res.redirect('/signuprequest');
        });
    });
});



function checkAuth(req, res, callback){//run callback if success
    //if loggedin user has authority 
    if(req.session.loginLevel == 0) callback();
    
    //not logged in
    else if(!req.session.loggedIn) res.redirect('/login'); 
    
    //need level up
    else res.redirect('/');
}

module.exports = router;    