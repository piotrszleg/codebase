var bcrypt = require('bcryptjs')
var mysql = require('mysql')
const saltRounds = 10
const password = "abc"

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "accounts"
})
con.connect(function(err) {
  if (err) throw err
  console.log("Connected to the mysql database.")
})

var sql = "SELECT password FROM users WHERE name='abc'";


/*bcrypt.hash(password, saltRounds, function(err, hash) {
	console.log("hashed password: "+hash);
})*/

con.query(sql, function (err, result) {
	console.log("hash from database: "+result[0].password)
	bcrypt.compare(password, String(result[0].password), function(err, result) {
		if (err) throw err
		console.log("compare result: "+result);
	})
})