var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
//    password: 'asdfqwerASDFQWER',
    database: 'hrappdb'
});


exports.addEmployee = function(emp_name, team_id, callback){
    var addEmployeeSQL = 'INSERT INTO Employee(emp_name, team_id) VALUES( ?, ? );';
    runQuery(addEmployeeSQL, [emp_name, team_id], callback);
};
exports.getAllEmployees = function (callback){
    var getAllEmployeesSQL = 'SELECT emp_id, emp_name, team_name ' +
                             'FROM Employee, Team ' +
                             'WHERE Employee.team_id = Team.team_id;';
    runQuery(getAllEmployeesSQL, [], callback);
};
exports.getAEmployee = function (emp_num, callback){
    var getAEmployeeSQL = 'SELECT emp_id, emp_name, team_name FROM Employee, Team '+
                          'WHERE Employee.team_id=Team.team_id '+
                          'AND emp_id = ?';
    runQuery(getAEmployeeSQL, [emp_num], callback);
};
exports.getAllTeams = function (callback){
    var getAllTeamsSQL = 'SELECT * FROM Team';
    runQuery(getAllTeamsSQL, [], callback); 
};
exports.getTeamMembers = function (team_id, callback){
    var getTeamMembersSQL = 'SELECT emp_id, emp_name, team_name FROM Employee, Team ' +
                            'WHERE Employee.team_id = Team.team_id ' +
                            'AND Employee.team_id = ?';
    runQuery(getTeamMembersSQL, [team_id], callback);
};
exports.getTeamName = function (team_id, callback){
    var getTeamNameSQL = 'SELECT team_name FROM Team WHERE team_id = ?';
    runQuery(getTeamNameSQL, [team_id], callback);
};
exports.updateEmployee = function (emp_id, emp_name, team_id, callback){
    var updateEmployeeSQL = 'UPDATE Employee SET emp_name = ?, team_id = ? WHERE emp_id = ?';
    runQuery(updateEmployeeSQL, [emp_name, team_id, emp_id], callback);
};
exports.removeEmployee = function(emp_id, callback){
    var removeEmployeeSQL = 'DELETE FROM Employee WHERE emp_id = ?';
    runQuery(removeEmployeeSQL, [emp_id],callback);
};



function runQuery(query , params, callback){
    pool.getConnection(function(error, connection){
        if(error) return console.log(error.message);
    
        connection.query(query, params, function(error, result){
            connection.release();
            if(error){return console.error(error.message);}
        
            callback(null, result);    
        });
    });
}
