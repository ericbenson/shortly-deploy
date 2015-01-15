var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var db = mongoose.connection;

var Url;
var User;

db.on('error', console.error);
db.once('open', function() {
  console.log('Connected to MongoDB')
  // Create your schemas and models here.
  var UrlSchema = new mongoose.Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    visits: Number
    //timestamps not included - may have to install a plugin
  });

  UrlSchema.pre('save', function(next){
    var shasum = crypto.createHash('sha1');
    // modify the url with shasum
    shasum.update(this.url);
    //update the code
    this.code = shasum.digest('hex').slice(0, 5);
    next();
  });

  var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: String
    //timestamps not included - may have to install a plugin
  });

  UserSchema.pre('save', function(next) {
    var user = this;
    // hash the password
    bcrypt.hash(user.password, null, null, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });

  UserSchema.methods.comparePassword = function(candidatePassword, cb) {
      bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
          if (err) return cb(err);
          cb(isMatch);
      });
  };

  Url = mongoose.model('Url', UrlSchema);
  User = mongoose.model('User', UserSchema);

  module.exports.Url = Url;
  module.exports.User = User;
  module.exports.db = db;
});

mongoose.connect('mongodb://localhost/test');


//mongodb://MongoLab-r:t2GV1vSlVuEEr2sUirN4.3W2d2OEz2bDQFnYDegGv6g-@ds052837.mongolab.com:52837/MongoLab-r
