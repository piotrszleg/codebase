var mysql = require('mysql');
var bcrypt = require('bcryptjs');

const saltRounds = 10;

//mysql
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "accounts"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to the mysql database.");
});

exports.register=(username, password, callback)=>{
	console.log("Register as %s with password %s", username, password);

	var sql = "SELECT * FROM users WHERE name=?";
	con.query(sql, username, function (err, result) {// find user of given username
		if(result[0]!==undefined){
			console.log("User already exists");
			callback(false);// user exists, so registration must fail
		} else {
			bcrypt.hash(password, saltRounds, function(err, hash) {// make hash out of password provided
				if (err) {
					 console.error(err);
					 callback(false);
				}
			    var sql = "INSERT INTO users (name, password) VALUES ?";
				con.query(sql, [[[username, hash]]], function (err, result) {// insert username and password to the database
					if (err) {
						 console.error(err);
						 callback(false);
					}
					callback(result);
				});
			});
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

exports.userslist=(callback)=>{
	var sql = "SELECT name, level FROM users";
	con.query(sql, function (err, result) {
		if (err) {
			 console.error(err);
		}
		callback(result);
	});
}