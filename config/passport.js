
/*var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');

module.exports = function(passport, User){
	passport.serializeUser(function(user, done){
		//console.log("passport.serializeUser:user:", user)
		done(null, user._id);
	})

	passport.deserializeUser(function(id, done){
		User.read(id, function(err, user){
			done(err, user);
		})
	});

	passport.use('local-login', 
		new LocalStrategy({
			usernameField: "username",
			passwordField: "password",
			passReqToCallback: true},
			function(req, username, password, done){
				//console.log("username", username);
				//console.log("username", username);
				// console.log("password", password);
				process.nextTick(function(){
					var pwdhash = crypto.createHash('sha1');
					// console.log("username", username);
					// console.log("password", password);
					User.findUser(username,					 
						function(err, user){
							// console.log('err:', err)
							// console.log('user:', user)
							if(err){return done(err);}
							if(!user){
								console.log("Invalid username or password");
								//done(null, null);
								return done(null, false);				
							}
							else{
								if(user.comparePassword(password)){
									console.log("Valid username and password");
									return done(null, user);//{id: user.id, name: username});
								}else{
									console.log("Invalid password");
									return done(null, false);
								}		
							}
						})
				})
			}))

	//////////////////////////////////////test
	passport.use('local-signup', 
		new LocalStrategy({passReqToCallback: true},
			function(req, username, password, done){
				//console.log("username", username);
				// console.log("password", password);
				process.nextTick(function(){
					// console.log("username", username);
					// console.log("password", password);
					User.findUser(username, 
						function(err, user){
							// console.log('error:', err);
							// console.log('user:', user);
							if(err){return done(err);}
							if(user){
								return done(null, false, req.flash('signupMessage', 'That username \"%s\" is already taken.', username));				
							}
							else{
								//var pwdhash = crypto.createHash('sha1');
								var userData = {username: username,
									      password: password};
								User.create(userData, function(err, data){
									// console.log('error:', err);
									// console.log('user:', data);
									if(err){
										return done(err);					
									}
									//console.log("passport:LocalStrategy:local-signup: succeeded: data", data);
									return done(null, data);
																	
								});				
							}
						});				
				})
			}))

}*/


var JwtStrategy = require('passport-jwt').Strategy;
//ExtractJwt = require('passport-jwt').ExtractJwt;
var crypto = require('crypto');

module.exports = function(passport, User){
	var opts = {};
	//opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = "johnjones";
	passport.use(new JwtStrategy(opts, function(jwt_payload, done){
		User.findUser(jwt_payload.username, function(err, user){
			if(err){
				return done(err, false);
			}
			if(user){
				//if(user.comparePassword(jwt_payload.password)){
					return done(null, user);
				// }else{
				// 	return done(err, false);
				// }
			}else{
				return done(err, false);
			}
		});
	}))
}

