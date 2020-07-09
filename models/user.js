// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var crypto = require('crypto');


// create a schema
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  meta: {
    //age: Number,
    //website: String
    firstname: String,
    lastname: String,
    email: String,
    occupation: String,
    hobby: String,
    country: String,
    last_visitor: {
      name: String,
      email: String,
      date: Date
    }

  },
  created_at: Date,
  updated_at: Date
});


// on every save, add the date
userSchema.pre('save', function(next) {
  var user = this;
  if(this.isModified('password') || this.isNew){
    var pwdhash = crypto.createHash('sha1');
    user.password = pwdhash.update(user.password).digest('hex');
    // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;    
  }
  next();

});

// custom method to add string to end of name
// you can create more important methods like name validations or formatting
// you can also do queries and find similar users 
userSchema.methods.comparePassword = function(password, cb) {
  // // add some stuff to the users name
  // this.name = this.name + '-dude'; 

  // return this.name;
  var pwdhash = crypto.createHash('sha1');
  return pwdhash.update(password).digest('hex')==this.password;    

};

// the schema is useless so far
// we need to create a model using it
//var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
//module.exports = User;

module.exports = function(){
  var User = mongoose.model('User', userSchema);

  function findUser(name, cb){
    User.findOne({username: name}, cb);
       
  }

  function read(id, cb){
    User.findOne({_id: id}, cb);
  }

  function updateUser(id, data, cb){
    data.updated_at = new Date();
    User.update({_id: id}, data, /*{},*/ cb);//{
    
  }

  function create(d, cb){
    //console.log(44, data)
    var data = {};
    data.meta = {};
    data.last_visitor = {};
    data.meta = data.meta || {};
    data.meta.firstname = data.firstname || "";
    data.meta.lastname = data.lastname || "";
    data.meta.username = data.username;
    data.meta.email = data.email || "";
    data.meta.occupation = data.occupation || "";
    data.meta.hobby = data.hobby || "";
    data.meta.country = data.country || "";

    //data.name: "";
    data.username = d.username,
    data.password = d.password
    //console.log(data)
    // create a new user called chris
    var newUser = new User(data);
    newUser.save(function(err){
      if(!err){
        User.findOne({username: d.username}, cb);
      }else{
        cb(err, false);
      }
    })
    //console.log(newUser)
  }

  // [START exports]
  return {
      findUser: findUser,
      read: read,
      updateUser: updateUser,
      create: create
  };
  // [END exports]
}