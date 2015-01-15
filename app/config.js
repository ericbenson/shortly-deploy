var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  var movieSchema = new mongoose.Schema({
    title: { type: String },
    rating: String,
    releaseYear: Number,
  , hasCreditCookie: Boolean
  });
});

mongoose.connect('mongodb://localhost/test');

//mongodb://MongoLab-r:t2GV1vSlVuEEr2sUirN4.3W2d2OEz2bDQFnYDegGv6g-@ds052837.mongolab.com:52837/MongoLab-r
