var crypto = require('crypto');
var Level = require('../models/level')();
var jwt = require('jwt-simple');

module.exports = function(app, passport, User, bayeux) {
	
	function debugRequest(req){
	    console.log("-->", req.method, req.url);
	} 
			
	//tested	
	app.post('/score', passport.authenticate('jwt', { session: false}), function(req, res){
		//debugRequest(req);
		if(req.user){//if valid login
			Level.setLeader(req.body.levelIndex, req.body.score, req.user.username,
				function(err, leaderData){	
					//leaderData.username = req.user.username;				
					bayeux.getClient().publish('/channel', leaderData);
					res.json(leaderData);
				});
			
		}else{
			res.json({success: false, msg: 'Authentication failed. User not found.'});
		}	
	})

	
	//tested	
	//gets the current leader
	app.post('/level', function(req, res){	
		//debugRequest(req);
		//console.log("req.user:", req.user)
		Level.getLeader(req.body.levelIndex, function(err, data){
			if(!err){
				res.json(data);	
				app.locals.leader = data.name;												
			}
		})
	    	
	})
	

	//gets the current leader
	// app.get('/userExist', function(req, res){	
	// 	debugRequest(req);
	// 	User.findUser(req.body.username, function(err, user){
	// 		if(err) 
	// 			res.json(userExist: false);
	// 		else
	// 			res.json(userExist: true);
	// 	});
	    	
	// })

	// route to test if the user is logged in or not 
	app.get('/loggedin', function(req, res) { 
		res.send(req.isAuthenticated() ? req.user : '0'); 
	}); 

	//tested	
    // app.post('/login', passport.authenticate('local-login', {}),
    // 	function(req, res){
    // 		//console.log("Test: ", req.headers.origin)
    // 		res.json({username: req.user.username, id: req.user._id});
    // 		//res.send(req.user);
    		
    // 	});	
	
	//tested	
	// app.post('/register', passport.authenticate('local-signup', {}),
	// 	function(req, res){
 //    		res.json({username: req.user.username, id: req.user._id});
 //    		//console.log(req.user)
 //    	});

	getToken = function(headers){
		if(headers && headers.authorization){
			var parted = headers.authorization.split(' ')
			if(parted.length == 2){
				return parted[1];
			}else{
				return null;
			}

		}else{
			return null;
		}

	}

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	app.post('/login', function(req, res) {
	  User.findUser(
	    req.body.username
	  , function(err, user) {
	    if (err) throw err;
	 
	    if (!user) {
	      res.send({success: false, msg: 'Authentication failed. User not found.'});
	    } else {
	      // check if password matches
	      //user.comparePassword(req.body.password, function (err, isMatch) {
	        if (user.comparePassword(req.body.password)) {
	          // if user is found and password is right create a token
	          var token = jwt.encode(user, "johnjones");
	          // return the information including token as JSON
	          res.json({success: true, token: 'JWT ' + token});
	        } else {
	          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
	        }
	      //});
	    }
	  });
	});

	app.post('/register', function(req, res){
		if(!req.body.username || !req.body.password){
			res.json({success: false, msg: "The usuername and/or password is invalid"})
		}else{
			var userData = {username: req.body.username, password: req.body.password};
			User.create(userData, function(err, user){
									 console.log('error:', err);
									// console.log('user:', data);
				if(err){
					res.json({success: false, msg: "Username already taken or database write error"});					
				}else{
					var token = jwt.encode(user, "johnjones");
					//console.log(token)
					res.json({success: true, token: "JWT " + token});
				}												
			});	
		}    		
    });

	//tested
	app.get('/leaderProfile', passport.authenticate('jwt', { session: false}), function(req, res){
		//debugRequest(req);
		//console.log("1234", req.session)
		var name = app.locals.leader; //req.params.leaderName;
		if(name === undefined) throw "Level leader unknown. Make sure the level route is called at least once."
		User.findUser(name, function(err, leader){
			if(err) return err;

			//Store the last vistor username and email in leader
			if(req.user && (req.user.username !== name)){
                //console.log("store visit info")
                leader.meta.last_visitor.name = req.user.username;
                leader.meta.last_visitor.email = req.user.meta.email;
                leader.meta.last_visitor.date = new Date();

                User.updateUser(leader._id, leader, function(err, data){					
					if(err) throw err;
					//console.log("leaderProfile:User.updateUser: ", data)
				});				
			}
			leader.password = undefined;
			res.json(leader);
		})			
	})

	// //tested
	// app.get('/profile', isLoggedIn, function(req, res){
	// 	debugRequest(req);		
	// 	var data = {};
	// 	if(req.user){
	// 		var data = req.user;
	// 		data.password = undefined;
	// 	}
	// 	//console.log(data);
	// 	res.json(data);		
	// })

    app.post('/profile', passport.authenticate('jwt', { session: false}), function(req, res){
		//debugRequest(req);
		var token = getToken(req.headers);
		//console.log(40 , token)
		if(token){
			var decodedUser = jwt.decode(token, "johnjones");
			//console.log(41 , decodedUser)
			//decodedUser.password = undefined;
			User.findUser(decodedUser.username, function(err, user){
				if(err){
					res.json({success: false, msg: "Databse error"});
				}else{
					user.password = undefined;
					res.json(user);
				}
			});
				
		}else{
			res.json({success: false, msg: "No token provided"});
		}			
	})

	//tested
	// app.get('/profile', function(req, res){
	// 	debugRequest(req);		
	// 	//console.log(req.session)	
	// })

	//tested		
	app.post('/editProfile', passport.authenticate('jwt', { session: false}), profileModified, function(req, res){
		//debugRequest(req);
		// console.log("req.body: ", req.body)
		User.updateUser(req.user._id, req.user, function(err, data){
			//console.log("User.updateUser: ", data)
			if(err) throw err;
				//req.user = data;
			res.json(data);
		});		
	})

	//tested	
	app.get('/logout', passport.authenticate('jwt', { session: false}), function(req, res){
		//debugRequest(req);
		req.logout();
		res.json({success: true, msg: "Logged out"});
	})

	//tested	
	app.post('/changePassword', passport.authenticate('jwt', { session: false}), function(req, res){
		//debugRequest(req);
		var oldPassword = req.body.oldPassword
		,newPassword = req.body.newPassword
		,confirmPassword = req.body.confirmPassword
		
			User.read(req.user.id, function(err, data){
				if(!err){
					var pwdhash = crypto.createHash('sha1');					
					if(pwdhash.update(oldPassword).digest('hex')=== data.password&&
						(newPassword === confirmPassword)){
						pwdhash = crypto.createHash('sha1');
						data.password = pwdhash.update(newPassword).digest('hex');
						delete data.id;
						User.updateUser(req.user.id, data, function(err){
							if(err)
								throw err;
							res.json({username: req.user.username, id: req.user._id});
						})

					}else{					
						res.json({});
					}
				}
			});			
		//}
	})
};

//Middleware


// function isLoggedIn(req, res, next){
// 	if (!req.isAuthenticated()) 
// 		res.send(401); 
// 	else 
// 		next(); 
// }

function profileModified(req, res, next){
	var data = req.user;
	if(data.meta.firstname !== req.body.firstname){
		data.meta.firstname = req.body.firstname;
		
		//console.log(1)
	}
	if(data.meta.lastname !== req.body.lastname){
		data.meta.lastname = req.body.lastname;
		
		//console.log(2)
	}		
	if(data.meta.email !== req.body.email){
		data.meta.email = req.body.email;
		
		//console.log(4)
	}
	if(data.meta.occupation !== req.body.occupation){
		data.meta.occupation = req.body.occupation;
		
		//console.log(5)
	}
	if(data.meta.hobby !== req.body.hobby){
		data.meta.hobby = req.body.hobby;
		
		//console.log(6)
	}
	if(data.meta.country !== req.body.country){
		data.meta.country = req.body.country;
		
		//console.log(7)
	}
	
	req.user = data;
	next();
	
}