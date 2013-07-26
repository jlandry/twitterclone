var express = require('express');
var app = express();
var routes = require('./routes');
var hbs = require('express3-handlebars');
var auth = [routes.checkAuth];

// Set handlebars as the default tempating engine
// and use main.handlebars as our default layout.
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

// Auth
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'secret123' }));

app.all('/', routes.home);

app.all('/login', routes.login);
app.get('/logout', routes.logout);

app.all('/feed', auth, routes.feed);
app.get('/users', auth, routes.users);
app.get('/profile', auth, routes.profile);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

