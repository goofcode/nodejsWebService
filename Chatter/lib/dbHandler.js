/******************************
 *                            *    
 * mysql db Handler functions *
 *                            *
 ******************************/
 
var mysql = require('mysql');
var crypto = require('crypto');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
//    password: 'asdfqwerASDFQWER',
    database: 'chatterDB'
});

exports.login = function (name, password, callback){//callback (error, loginSuccess, userID)
    var loginSQL = 'SELECT userID, userPW FROM User WHERE userName = ?';
    pool.getConnection(function(error, connection){
        if(error) return callback(error, false, null);
        
        connection.query(loginSQL, [name], function(error, result){
            connection.release();
            if(error) return callback(error, false, null);
           
            //if login info exists
            if(result.length){
                var hash = crypto.createHash('sha256').update(password).digest('hex');
                
                //success
                if(result[0].userPW == hash) return callback(null, true, result[0].userID);  
                
                //incorrect pw
                else return callback(null, false, null);
            }
            else return callback(null, false, null);
        });
    });
};

exports.getChatList = function(userID, callback){//callback(error, roomIDs)
    var getRoomSQL = 'SELECT roomID, roomName FROM Room WHERE roomID IN (SELECT roomID FROM UserRoomRelation WHERE userID = ?)';
    pool.getConnection(function(error, connection){
        if(error) return callback(error, null);
        
        connection.query(getRoomSQL, [userID], function(error, roomsInfo){
            connection.release();
            if(error) return callback(error, null);
            
            callback(null, roomsInfo);
        });
    });
};


exports.addChat = function(roomName, invitedUserIDs, callback){//callback(error)

    pool.getConnection(function(error,connection){
        if(error) return callback(error);
        
        //begin of transaction
        connection.beginTransaction(function(error){

            if(error){
                connection.release();
                return callback(error);
            } 
                
            var addRoomSQL = 'INSERT INTO Room (roomName) VALUES (?)';
            
            //insert row for room
            connection.query(addRoomSQL, [roomName], function(error, result){
                if(error){
                    return connection.rollback(function(){
                        connection.release();
                        callback(error);
                    }); 
                }
                
                
                //get roomID from result    
                var roomID = result.insertId;
                var addRelationSQL = 'INSERT INTO UserRoomRelation (UserID, RoomID) VALUES (?, '+roomID+')';
                
                //put relations into table
                var forEachCounter = 0;
                invitedUserIDs.forEach(function(userID){
                    connection.query(addRelationSQL, [userID], function(error, result){
                        if(error){
                            return connection.rollback(function(){
                                connection.release();
                                callback(error);
                            }); 
                        }       
                        
                        //commit transaction at the end of insert
                        forEachCounter++;
                        if(forEachCounter === invitedUserIDs.length){
                            connection.commit(function(error){
                                if(error){ 
                                    return connection.rollback(function(){
                                        connection.release();
                                        callback(error);
                                    }); 
                                }
                                
                                connection.release();
                                return callback(null);       
                            });
                        } 
                    });
                });
            });
        });
        //end of trasaction
    });
};

exports.checkUserExist = function(userName, callback){//callback(error, exist, userID)
    var checkUserExistSQL = 'SELECT userID FROM User WHERE userName = ?';
    
    pool.getConnection(function(error,connection){
        if(error) return callback(error, null, null);
        
        connection.query(checkUserExistSQL, [userName], function(error, result){
            connection.release();
            if(error) return callback(error, null, null);
            
            if(result.length) callback(null, true, result[0].userID);
            else callback(null, false, null);
        });
    });
};

exports.checkAuthToRoom = function(userID, roomID, callback){//callback(error, hasAuth, roomName)
    var checkAuthToRoomSQL = 'SELECT * FROM UserRoomRelation WHERE userID = ? AND roomID = ?';
    var getRoomNameSQL = 'SELECT * FROM Room WHERE roomID = ?';
    
    pool.getConnection(function(error, connection){
        if(error) return callback(error, null, null);
        
        connection.query(checkAuthToRoomSQL, [userID, roomID],function(error, relation){
            if(error){ 
                connection.release();
                return callback(error, null, null);
            }
            
            //no relation or no room
            if(relation.length == 0){ 
                connection.release();
                return callback(null, false, null);
            }
            
            connection.query(getRoomNameSQL, [roomID], function(error, roomInfo){
                connection.release();
                if(error) return callback(error, null, null);
                
                return callback(null, true, roomInfo[0].roomName);
            });
        });
    });
};

exports.getLastMessages = function(roomID, callback){//callback(error, lastMessages)
    var getLastMessagesSQL = 'SELECT User.userName, Message.text, Message.datetime '+
                             'FROM Message, User '+
                             'WHERE roomID = ? AND Message.senderID = User.userID '+
                             'ORDER BY datetime '+
                             'LIMIT 50';

    pool.getConnection(function(error, connection){
        if(error) return callback(error, null);
        connection.query(getLastMessagesSQL, [roomID], function(error, result){
            connection.release();
            if(error) return callback(error, null);
            
            callback(null, result);
        });
    });
};

exports.addMessage = function(senderID, roomID, text, callback){//callback(error)
    var addMessageSQL = 'INSERT INTO Message(datetime, roomID, senderID, text) VALUES(?,?,?,?)';
    
    
    pool.getConnection(function(error, connection){
        if(error) return callback(error);
        
        var date = new Date();
        
        connection.query(addMessageSQL,[date, roomID, senderID, text], function(error, result){
            connection.release();
            if(error) return callback(error);
            
            callback(null);
        });
    });
    
};


