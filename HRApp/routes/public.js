var express = require('express');
var accDB = require('../lib/accountDB');
var router = express.Router();

//home
router.get('/', function(req, res, next){
    res.render('../views/home');
});


//login routing
router.get('/login', function(req, res, next){
    res.render('../views/login',{loginTry:undefined});
});
router.post('/login', function(req, res, next){

    //if already logined
    if(req.session.loggedIn) res.redirect('/');
    
    else
    accDB.login(req.body.email, req.body.password, function(error, loginSuccess, loginLevel){
        if(error) return next(error);
        
        //login success
        if(loginSuccess){
            //save session
            req.session.loggedIn = true;
            req.session.email = req.body.email;
            req.session.loginLevel = loginLevel;
            res.redirect('/');
        }
        //fail
        else res.render('../views/login',{loginTry:'failed'});
    });
});


//logout routing
router.get('/logout', function(req, res, next){
    req.session.destroy(function(error){
        if(error) console.error(error);
        res.redirect('/');
    });
});


//signup routing
router.get('/signup', function(req, res, next){
    res.render('../views/signup',{signupTry:undefined, failReason:undefined});
});

router.post('/signup', function(req, res, next){
    accDB.signup(req.body.email, req.body.password, function(error, signupSuccess, failReason){
        if(error) return next(error);
        
        if(signupSuccess) res.render('../views/signup',{signupTry:'success', failReason:undefined});
        
        else res.render('../views/signup',{signupTry:'failed', failReason: failReason});
    });
});

module.exports = router;    