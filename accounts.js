var bcrypt = require('bcryptjs');
const saltRounds = 10;

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/codebase";
// get the database object
var db=null;
MongoClient.connect(url)
	.then(function callback(_db){db=_db.db("codebase")})// dafuq mongo?
	.catch((err)=>{throw err});

function promiseWhen(condition, timeout){
	if(!timeout){
		timeout = 2000;
	}
	return new Promise((resolve, reject)=>{
		setTimeout(()=>reject(new Error("Promise when expired.")), timeout);// reject promise if given timeout is exceeded
		function loop(){
			if(condition()){//check condition
				resolve();
			} else {
				setTimeout(loop,0);
			}
		}
		setTimeout(loop,0);
	});
}

exports.get=(username)=>{
	return new Promise(async (resolve, reject)=>{
		try {
			await promiseWhen(()=>db);
			resolve((await db.collection("users").find(
				{"username" : username}
			)).next());
		} catch(err){
			reject(err);
		}
	});
}

exports.register=(username, password)=>{
	return new Promise(async (resolve, reject)=>{
		try {
			await promiseWhen(()=>db);
			if((await exports.get(username))==null){
				var hashed = await bcrypt.hash(password, saltRounds);
				resolve(await db.collection("users").insertOne(
					{"username" : username, "password" : hashed}
				));
			} else{
				reject(new Error("User already exists."));
			}
		} catch(err){
			reject(err);
		}
	});
}

exports.login=(username, password, callback)=>{
	console.log("Login as %s with password %s", username, password);

	var sql = "SELECT password FROM users WHERE name=?";
	con.query(sql, username, function (err, result) {// find user of given username
		if (err) {
			 console.error(err);
			 callback(false);
		}
		if(result[0]!==undefined){// if the user exists check the password
			bcrypt.compare(password, String(result[0].password), function(err, result) {
				if (err) {
					 console.error(err);
					 callback(false);
				}
		      	callback(result);
		    });	
		} else {
			callback(false);
		}
	});
}

exports.userdata=(username, callback)=>{
	console.log("Getting data of user: %s", username);

	if(username===undefined){
		callback(undefined);
		return;
	}

	var sql = "SELECT name, level FROM users WHERE name=?";
	con.query(sql, username, function (err, result) {// find user of given username
		if (err) {
			 console.error(err);
			 callback(undefined);
		} else {
			callback(result[0]);
		}
	});
}

exports.userslist=()=>{
	return new Promise((resolve, reject)=>{
		promiseWhen(()=>db)
		.then(()=>{
			db.collection("users").find({}).toArray()
				.then(resolve)
				.catch(reject);
		})
		.catch(reject);
	});
}