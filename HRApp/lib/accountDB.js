var mysql = require('mysql');
var crypto = require('crypto');
var err = require('./errorHandle.js');


var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
//    password: 'asdfqwerASDFQWER',
    database: 'hrappdb'
});

exports.getAccounts = function (callback){
    var getAccountsSQL = 'SELECT acc_email, acc_level FROM Account';
    runQuery(getAccountsSQL, callback);
};
exports.getSignupRequest = function(callback){
    var getSignupRequestSQL = 'SELECT req_acc_id, req_email FROM SignupRequest';
    runQuery(getSignupRequestSQL, callback);
};

exports.login = function (email, password, callback){//callback (error, loginSuccess, loginLevel)
    var loginSQL = 'SELECT acc_password, acc_level FROM Account WHERE acc_email = ?';
    pool.getConnection(function(error, connection){
        if(error) return err.loginErrorHandle(error,callback);
        
        connection.query(loginSQL, [email], function(error, result){
            connection.release();
            if(error) return err.loginErrorHandle(error,callback);
           
            //if login info exists
            if(result.length){
                var hash = crypto.createHash('sha256').update(password).digest('hex');
                if(result[0].acc_password==hash) return callback(null, true, result[0].acc_level);  
            }
            else return callback(null, false, undefined);
        });
    });
};
exports.signup = function (email, password, callback){//callback (error, signupSuccess, reason)
    
    ////check if email already exist
    var emailCheckSQL = 'SELECT acc_email FROM Account WHERE acc_email = ?';
    pool.getConnection(function(error, connection){
        if(error) return err.signupErrorHandle(error,callback);
        
        connection.query(emailCheckSQL, [email], function(error, result){
            connection.release();
            if(error) return err.signupErrorHandle(error,callback);
           
            //if login info exists
            if(result.length) return callback(null, false, 'overlap');
        });
    });
    ////check if email is submitted to request
    var signupCheckSQL = 'SELECT req_email FROM SignupRequest WHERE req_email = ?';
    pool.getConnection(function(error, connection){
        if(error) return err.signupErrorHandle(error,callback);
        
        connection.query(signupCheckSQL, [email], function(error, result){
            connection.release();
            if(error) return err.signupErrorHandle(error,callback);
           
            //if login info exists
            if(result.length) return callback(null, false, 'overlap');
        });
    });

    
    ////check email password form 
    //reg exp for email
    var reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
    
    //if have wrong form
    if(email.search(reg_email) == -1 || password.length > 20 || password.length < 8){
        return callback(null, false, 'form');
    }
    //check done    

    
    ////submit request
    var passwordHashed = crypto.createHash('sha256').update(password).digest('hex');
    var signupReqSQL = 'INSERT INTO SignupRequest(req_email, req_password) ' +
                       'VALUE(?, ?)';
                       
    pool.getConnection(function(error, connection){
        if(error) return err.signupErrorHandle(error,callback);
        connection.query(signupReqSQL, [email, passwordHashed], function(error, result){
            connection.release();
            if(error) return err.signupErrorHandle(error,callback);  
            
            return callback(null, true, undefined);
       });
    });        
};

//for manager
exports.approveAccount = function (reqId, callback){//callback(error)
    var approveSQL = 'START TRANSACTION ' +
                     'INSERT INTO Account(acc_email, acc_password, acc_level) SELECT req_email, req_password, 1 FROM SignupRequest WHERE req_acc_id = ? ' +
                     'DELETE FROM SignupRequest WHERE req_acc_id = ? '+
                     'COMMIT';
    
    pool.getConnection(function(error, connection){
        if(error) return err.approveErrorHandle(error,callback);
        
        connection.query(approveSQL, [reqId, reqId], function(error, result){
            connection.release();
            if(error) return err.approveErrorHandle(error,callback);
        });
    });
    
    callback(null);
};
exports.disapproveAccount = function(reqId, callback){
    var deleteSQL = 'DELETE FROM SignupRequest WHERE req_acc_id = ?';
    
    pool.getConnection(function(error, connection){
        if(error) return err.approveErrorHandle(error,callback);
        
        connection.query(deleteSQL, [reqId], function(error, result){
            connection.release();
            if(error) return err.approveErrorHandle(error,callback);
        });
        
        callback(null);
    });
};


function runQuery(query ,callback){
    pool.getConnection(function(error, connection){
        if(error) return console.log(error.message);
    
        connection.query(query,function(error, result){
            connection.release();
            if(error){return console.error(error.message);}
        
            callback(null, result);    
        });
    });
}
