exports.sendError = function(res, errorNum){
    console.log()
    res.render('../views/error',{errorNum:errorNum});
};


exports.loginErrorHandle = function(error,callback){//callback(error, success, level)
    console.log(error.message);
    callback(null, false, undefined);
};

exports.signupErrorHandle = function(error, callback){//callback(error, success, reason)
    console.log(error.message);
    callback(null,false, undefined);
}

exports.approveErrorHandle = function(error,callback){//callback(error)
    console.log(error.message);
    callback(null);
};
