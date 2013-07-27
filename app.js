var express = require('express');
var app = express();
var routes = require('./routes');
var hbs = require('express3-handlebars');
var auth = [routes.checkAuth];
var models = require('./models');

// Set handlebars as the default tempating engine
// and use main.handlebars as our default layout.
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Define what directory we would like to serve static files from.
app.use('/public', express.static('public'));

// Upload directory for our images
app.use(express.bodyParser({uploadDir:'./uploads'}));
// Cookie parser for our authentication library.
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'secret123' }));

// Middleware function to add the user to the request object.
app.use(function(request, response, next) {
  if (request.session.userID) {
    models.User.findOne({'_id': request.session.userID}, function(err, user) {
      if (!err) request.user = user;
      next();
    });
  }
  else {
    next();
  }
});

app.all('/', routes.home);

app.all('/login', routes.login);
app.get('/logout', routes.logout);

app.all('/feed', auth, routes.feed);
app.get('/users', auth, routes.users);

app.post('/follow', auth, routes.follow);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

