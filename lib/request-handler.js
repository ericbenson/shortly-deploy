var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Url.find(function(err,urls){
    if(err) throw err;
    res.send(200, urls);
  })
};

// need to refactor to use MongoDB
exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  db.Url.findOne({ url: uri }, function(err,found){
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new db.Url({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err,url){
          res.send(200, url);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ username: username }, function(err,user){
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({username: username}, function(err, user){
    if (!user) {
      var newUser = new db.User({
        username: username,
        password: password
      });
      console.log(newUser)
      newUser.save(function(err, user){
        util.createSession(req, res, user);
      })
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  })
};

exports.navToLink = function(req, res) {
  db.Url.findOne({ code: req.params[0] }, function(err, link){
    if (!link) {
      res.redirect('/');
    } else {
      link.visits = link.visits+1;
      link.save(function(err, url){
        return res.redirect(link.url);
      });
    }
  });
};
