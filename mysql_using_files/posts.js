/*
Saving posts to mysql database and retrieving them.
*/

var mysql = require('mysql');

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

// post : {owner, title, text}
exports.create=(post, callback)=>{
	var sql = "INSERT INTO posts (owner, title, text) VALUES ?";
	con.query(sql, [[[post.owner, post.title, post.text]]], function (err, result) {
        if (err) {
            console.error(err);
            callback(null);
       } else {
           callback(result);
       }
    });
}

// updated : {title, text, id}
exports.edit=(id, updated, callback)=>{
  var sql = "UPDATE posts SET title=?, text=? WHERE id=?";
	con.query(sql, [updated.title, updated.text, id], function (err, result) {
        if (err) {
            console.error(err);
            callback(null);
       } else {
           callback(result);
       }
    });
}

exports.delete=(id, callback)=>{
  var sql = "DELETE FROM posts WHERE id=?";
	con.query(sql, [id], function (err, result) {
        if (err) {
            console.error(err);
            callback(null);
       } else {
           callback(result);
       }
    });
}

exports.get=(id, callback)=>{
    var sql = "SELECT * FROM posts WHERE id=?";
    con.query(sql, id, function (err, result) {
		if (err) {
			 console.error(err);
			 callback(null);
		} else {
			callback(result[0]);
		}
	});
}

exports.getAll=(callback)=>{
  var sql = "SELECT * FROM posts";
  con.query(sql, function (err, result) {
  if (err) {
     console.error(err);
     callback(null);
  } else {
    callback(result);
  }
});
}