var models = require('./models');
var fs = require('fs');
var _ = require("underscore");

exports.home = function (request, response) {
  if (request.method == 'POST') {
    var name        = request.body.name;
    var username    = request.body.username;
    var password    = request.body.password;
    
    var tmp_path    = request.files.image.path;
    var target_path = './uploads/images/user/' + request.files.image.name;

    console.log(tmp_path);
    console.log(target_path);

    if (tmp_path) {
      fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
          if (err) throw err;
          console.log('profile image successfully saved.');
        });
      });
    }
    else {
      response.render('home', { layout: 'base', formError: 'You must upload a profile image.' });
    }

    // Check that the username and password are acceptable.
    if (username.length >= 3 && password.length >= 6) {
      // Create a new user
      var newUser = new models.User({
        name:     name,
        username: username,
        password: password,
        image: target_path
      });

      // Save the new user.
      newUser.save(function (error, user) {
        if (error) {
          console.log(error);
          response.render('home', { layout: 'base', formError: 'Sorry, that username is already taken.' });
        }
        else {
          request.session.userID = user._id;
          response.redirect('/feed');
        }
      });
    }
    else {
      response.render('home', { layout: 'base', formError: 'Your username must contain at least 3 characters.<br/> Your password must contain at least 6 characters.' });
    }
  }
  else {
    response.render('home', { layout: 'base' });
  }
}

exports.login = function (request, response) {
  if (request.session.userID) {
    return response.redirect('/feed');
  }

  if (request.method == 'POST') {
    
    var username = request.body.username;
    var password = request.body.password;

    var user = models.User.findOne({'username': username }, function(error, user) {
      if (error) response.render('login', { layout: 'base', formError: 'An error occurred. Please try again.' });
    
      if ( user && user.authenticate(password) ) {
        request.session.userID = user.id;
        response.redirect('/feed');
      }
      else {
        response.render('login', { layout: 'base', formError: 'Your login details were is incorrect. Please try again.' });
      }
    });
  }
  else {
    response.render('login', { layout: 'base' });
  }  
}

exports.logout = function (request, response) {
  delete request.session.userID;
  response.redirect('/');
}

exports.checkAuth = function (request, response, callback) {
  if(!request.session.userID) {
    response.redirect('/');
  }

  callback();
}

exports.feed = function (request, response) {
  if (request.method == 'POST') {
    var postBody = request.body.postBody;

    // Create a new post
    var newPost = new models.Post({
      user: request.session.userID,
      body: postBody,
      date: new Date()
    });

    // Save the new post.
    newPost.save(function (error, user) {
      if (error) {
        console.log(error);
        response.render('feed', { layout: 'base', formError: 'There was an error creating your post.' });
      }
      else {
        response.redirect('/feed');
      }
    });
  }
  else {
    var userIDs = _.union(request.user.following, [request.user.id]) 

    models.Post.find()
    .where('user').in(userIDs)
    .populate('user')
    .sort('-date')
    .exec(function (err, posts) {
      if (err) console.log(err);
      response.render('feed', { 'posts': posts, 'user': request.user });
    });
  }
}

exports.users = function (request, response) {
  models.User.find()
  .where('_id').ne( request.session.userID )
  .exec(function(err, users) {
    _.each(users, function (user) {
      // TODO: fix this.
      console.log(request.user.id);
      console.log(user.followers);
      console.log(request.user.id in user.followers);
      if(request.user.id in user.followers) {
        user.followed = true;
      }
      console.log(user);
    });
    response.render('users', { users: users });
  });
}

exports.follow = function (request, response) {
  if (request.body.id && request.user.id ) {
    models.User.findOne({ '_id': request.body.id }, function (err, userToFollow) {
      if (err) response.end(err);
      userToFollow.followers.push(request.user.id);
      request.user.following.push(userToFollow.id);

      userToFollow.followers = _.uniq(userToFollow.followers);
      request.user.following = _.uniq(request.user.following);

      userToFollow.save();
      request.user.save();

      response.end( 'success' );
    });
  }
}

