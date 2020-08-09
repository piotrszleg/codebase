/*
author: Piotr Szleg

Website providing login and register functionality.

TODO: 
- move functionality to module, comment
- handlebar.js
*/

var accounts = require("./accounts");
var posts = require("./posts");
var parser = require('./parser');

var express = require('express');
var session = require('express-session');
var bodyParser = require("body-parser");
var RateLimit = require('express-rate-limit');
var app = express();

app.use(bodyParser.json()); // Configures bodyParser to accept JSON
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

var sess = {
  secret: 'This needs to be replaced in public release.',
  cookie: {},
  resave: true,
  saveUninitialized: false
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));

function limitErrorPage(req, res) {
	errorPage(new Error("Please try again after an hour."), res);
}

function errorPage(error, res){
	parser.run("error.html", {"message":error.message}, (result)=>res.send(result));
}

var standardLimiter = new RateLimit({
	windowMs: 15*60*1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	delayMs: 0 // disable delaying - full speed until the max limit is reached
});

//  apply to all requests
app.use(standardLimiter);

var stateChangeLimiter = new RateLimit({
	windowMs: 60*60*1000, // 1 hour window
	delayAfter: 1, // begin slowing down responses after the first request
	delayMs: 3*1000, // slow down subsequent responses by 3 seconds per request
	max: 5, // start blocking after 5 requests
	handler : limitErrorPage
});
   
 // only apply to requests that begin with /api/
app.use([/code\/create/, /code\/edit\/([a-z0-9]+)/, '/register', '/login'], stateChangeLimiter);

function canEditPost(post, request){
	return post.author && request.session.user==post.author;
}

app.get("/", function (req, res) {
	res.redirect('/code/create/');
});

 app.get(/code\/create/, function (req, res) {
	parser.run("edit.html", {user:req.session.user}, (result)=>res.send(result));
 });
app.post(/code\/create/, function (req, res) {
	posts.create(req.session.user, req.body.title, req.body.text, req.body.language, req.body.tags)
	.then((result)=>res.redirect("/code/"+result))
	.catch((err)=>errorPage(err, res));
});

app.get(/code\/all/, function (req, res) {
	posts.all()
		.then((result)=>parser.run("all.html", {rows:result, user:req.session.user}, (result)=>res.send(result)))
		.catch((err)=>errorPage(err, res));
 });

app.get(/code\/remove\/([a-z0-9]+)/, function (req, res) {// should be changed to post in the future
	posts.get(req.params[0])
		.then((result)=>{
			if(canEditPost(result, req)){
				posts.remove(req.params[0])
					.then(()=>res.redirect("/code/all"))
					.catch((err)=>errorPage(err, res));
			} else {
				errorPage(new Error("You can't remove this post."), res);
			}
		})
		.catch((err)=>errorPage(err, res));
 });

 app.get(/code\/edit\/([a-z0-9]+)/, function (req, res) {
	posts.get(req.params[0])
		.then((result)=>{
			if(canEditPost(result, req)){
				parser.run("edit.html", Object.assign({user:req.session.user}, result), (result)=>res.send(result))
			} else {
				errorPage(new Error("You can't edit this post."), res);
			}
		})
		.catch((err)=>errorPage(err, res));
 });
 app.post(/code\/edit\/([a-z0-9]+)/, function (req, res) {
	posts.get(req.params[0])
		.then((result)=>{
			if(canEditPost(result, req)){
				posts.edit(req.params[0], req.session.user, req.body.title, req.body.text, req.body.language, req.body.tags)
					.then(()=>res.redirect("/code/"+req.params[0]))
					.catch((err)=>errorPage(err, res));
			} else {
				errorPage(new Error("You can't edit this post."), res);
			}
		})
		.catch((err)=>errorPage(err, res));
});

app.get(/code\/([a-z0-9]+)/, function (req, res) {
	posts.get(req.params[0])
		.then((result)=>
			parser.run("view.html", Object.assign({user:req.session.user}, result), (result)=>res.send(result)))
		.catch((err)=>errorPage(err, res));
 });

// User registry routes
app.post('/register', function (req, res) {
	accounts.register(req.body.user, req.body.password)
		.then(()=>{
			req.session.user=req.body.user;
			res.redirect('/');
		})
		.catch((err)=>errorPage(err, res));
});
app.post('/login', function (req, res) {
	accounts.login(req.body.user, req.body.password)
		.then(()=>{
			req.session.user=req.body.user;
			res.redirect('/');
		})
		.catch((err)=>errorPage(err, res));
});
app.get('/logout', function (req, res) {
	req.session.user=undefined;
	res.redirect('/');
});
app.get('/userslist', function (req, res) {
	accounts.list()
		.then((result)=>parser.run("users.html", {rows:result, user:req.session.user}, (result)=>res.send(result)))
		.catch((err)=>errorPage(err, res));
});

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;

	if(host==="::"){
		host="localhost";
	}
	
	console.log("App listening at http://%s:%s", host, port);
});