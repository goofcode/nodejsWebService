var express = require('express');
var hrDB = require('../lib/hrDB.js');
var router = express.Router();


////employees routing
router.get('/employees', function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.getAllEmployees(function(error, data){
            if(error) return next(error);
            
            var jsonData = JSON.stringify(data);
            res.render('../views/employees',{employees: jsonData});
        });
    });
});

//add page
router.get('/employees/add', function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.getAllTeams(function(error, dataTeam){
            if(error) return next(error);            

            var jsonTeam = JSON.stringify(dataTeam);
            res.render('../views/add', {all_team_names:jsonTeam});
        });
    });
});
//add action
router.post('/employees/add',function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.addEmployee(req.body.emp_name, req.body.team_id, function(error, data){
            if(error) return next(error);            

            res.redirect('/employees');
        });
    });
});

//remove action
router.get('/employees/remove/:employeeId', function(req, res, next) {
   checkAuth(req, res, function(){
      hrDB.removeEmployee(req.params.employeeId, function(error, data){
         if(error) return next(error);
         res.redirect('/employees');
      });
   }); 
});

//edit page
router.get('/employees/edit/:employeeId', function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.getAEmployee(req.params.employeeId, function(error, dataEmp){
            if(error || dataEmp.length == 0) return next(error);            
            
            hrDB.getAllTeams(function(error, dataTeam){
                if(error) return next(error);
                
                var jsonTeam = JSON.stringify(dataTeam);
                res.render('../views/edit',{emp_id:dataEmp[0].emp_id, emp_name:dataEmp[0].emp_name, team_name:dataEmp[0].team_name, all_team_names: jsonTeam});
            });
        });
    });
});
//edit action
router.post('/employees/edit/:employeeId', function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.updateEmployee(req.params.employeeId, req.body.emp_name, req.body.team_id, function(error, data){
            if(error) return next(error);
            res.redirect('/employees/'+req.params.employeeId);
        });
    });
});

//a employee page
router.get('/employees/:employeeId', function(req,res,next){
    checkAuth(req, res, function(){
        hrDB.getAEmployee(req.params.employeeId, function(error, data){
            if (error || data.length == 0) return next(error);
            
            res.render('../views/employee', {emp_id:data[0].emp_id, emp_name:data[0].emp_name, team_name:data[0].team_name});
        });
    });
});


////teams routing
router.get('/teams', function(req, res, next){
    checkAuth(req, res, function(){
        hrDB.getAllTeams(function(error, data){
            if (error) return next(error); 
            
            var jsonData = JSON.stringify(data);
            res.render('../views/teams',{teams:jsonData});
        });
    });
});
//a team page
router.get('/teams/:teamId', function(req,res,next){
    checkAuth(req, res, function(){
        var teamName;
        var teamMembersJson;
        
        hrDB.getTeamName(req.params.teamId,function(error, dataName){
            if (error || dataName.length == 0) return next(error);
            
             
            teamName = dataName[0].team_name;
            hrDB.getTeamMembers(req.params.teamId, function(error, dataMember){
                if (error || dataMember.length == 0) return next(error);
                
                teamMembersJson = JSON.stringify(dataMember);
                res.render('../views/team',{team_name:teamName, team_members:teamMembersJson});
            });
        });
    }); 
});



function checkAuth(req, res, callback){//run callback if success
    //if loggedin user has authority 
    if(req.session.loggedIn) callback();
    
    //not logged in
    else res.redirect('/login'); 
}

module.exports = router;