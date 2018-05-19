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
var app = express();

app.use(bodyParser.json()); // Configures bodyParser to accept JSON
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

var sess = {
  secret: 'i still watch minecraft videos on youtube',
  cookie: {},
  resave: true,
  saveUninitialized: false
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));

function errorHandler(error, res){
	parser.run("error.html", {"message":error}, (result)=>res.send(result));
}

function canEditPost(post, request){
	return request.session.user==post.owner && post.owner;
}

app.get("/", function (req, res) {
	res.redirect('/code/create/');
});

app.get(/code\/([0-9]+)\/edit/, function (req, res) {
	posts.get(req.params[0], (result)=>{
		if(result==null){
			res.send("There is no post with this id.");
		} else if(canEditPost(result, req)){
			parser.run("edit.html", Object.assign(result, {user:req.session.user}), (result)=>res.send(result));
		}else{
			parser.run("error.html", {message:"You can't edit this post."}, (result)=>res.send(result));
		}
	});
 });
 app.post(/code\/([0-9]+)\/edit/, function (req, res) {
	console.log("post edit");
	posts.get(req.params[0], (result)=>{
		if(canEditPost(result, req)){
			posts.edit(req.params[0], {title:req.body.title, text:req.body.text}, (result)=>{
				if(result) {
					res.redirect("/code/"+req.params[0]);
				} else {
					res.send("fail");
				}
			});
		} else {
			parser.run("error.html", {message:"You can't edit this post."}, (result)=>res.send(result));
		}
	});
});
 app.get(/code\/create/, function (req, res) {
	parser.run("edit.html", {user:req.session.user}, (result)=>res.send(result));
 });
 app.post(/code\/create/, function (req, res) {
	posts.create({title:req.body.title, text:req.body.text, owner:req.session.user}, (result)=>{
		if(result) {
			res.redirect("/code/all/");
		} else {
			parser.run("error.html", {message:"Creating post failed."}, (result)=>res.send(result));
		}
	});
});

 app.get(/code\/([0-9]+)\/remove/, function (req, res) {// should be changed to post in the future
	posts.get(req.params[0], (result)=>{
		if(canEditPost(result, req)){
			posts.delete(req.params[0], ()=>res.redirect("/code/all"));
		} else {
			parser.run("error.html", {message:"You can't delete this post."}, (result)=>res.send(result));
		}
	});
 });
 app.get(/code\/([0-9]+)\/report/, function (req, res) {
	console.log("Requested report on: %s", req.params[0]);
	res.redirect("/");
 });
 app.get(/code\/[0-9]+\/raw/, function (req, res) {
	console.log("Requested raw of: %s", req.params[0]);
	res.redirect("/");
 });
app.get(/code\/([0-9]+)/, function (req, res) {
	posts.get(req.params[0], (result)=>{
		if(result==null){
			parser.run("error.html", {message:"There is no post with this id."}, (result)=>res.send(result));
		} else{
			parser.run("view.html", result, (result)=>res.send(result));
		}
	});
 });
 app.get(/code\/all/, function (req, res) {
	posts.getAll((result)=>{
		if(result==null){
			parser.run("error.html", {message:"Error."}, (result)=>res.send(result));
		} else{
			parser.run("all.html", {rows:result, user:req.session.user}, (result)=>res.send(result));
		}
	});
 });

// User registry routes
app.post('/register', function (req, res) {
	accounts.register(req.body.user, req.body.password, (result)=>{
		if(result) {
			req.session.user=req.body.user;
			res.redirect('/');
	    } else {
			parser.run("error.html", {message:"Registration failed"}, (result)=>res.send(result));
		}
	});
});
app.post('/login', function (req, res) {
	accounts.login(req.body.user, req.body.password, (result)=>{
		if(result) {
			req.session.user=req.body.user;
			res.redirect('/');
	    } else {
			parser.run("error.html", {message:"Incorrect user data."}, (result)=>res.send(result));
		}
	});
});
app.get('/logout', function (req, res) {
	console.log("Log out");
	req.session.user=undefined;
	res.redirect('/');
});
app.get('/userslist', function (req, res) {
	accounts.list()
		.then((result)=>parser.run("users.html", {rows:result, user:req.session.user}, (result)=>res.send(result)))
		.catch((err)=>errorHandler(err, res));
});

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;

	if(host==="::"){
		host="localhost";
	}
	
	console.log("App listening at http://%s:%s", host, port);
});