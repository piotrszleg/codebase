var bcrypt = require('bcryptjs')
const saltRounds = 10

var MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/codebase"
// get the database object
var db=null
MongoClient.connect(url)
	.then(function callback(client){db=client.db("codebase")})
	.catch((err)=>{throw err})

// returns a Promise that resolves when condition evaluates to non falsy value
function promiseWhen(condition, timeout){
	if(!timeout){
		timeout = 2000
	}
	return new Promise((resolve, reject)=>{
		setTimeout(()=>reject(new Error("Promise when expired.")), timeout)// reject promise if given timeout is exceeded
		function loop(){
			if(condition()){//check condition
				resolve()
			} else {
				setTimeout(loop,0)
			}
		}
		setTimeout(loop,0)
	})
}

exports.get=(username)=>{
	return new Promise(async (resolve, reject)=>{
		await promiseWhen(()=>db)
		resolve((await db.collection("users").find(
			{"username" : username}
		)).next())
	})
}

exports.register=(username, password)=>{
	return new Promise(async (resolve, reject)=>{
		await promiseWhen(()=>db)
		if((await exports.get(username))==null){
			var hashed = await bcrypt.hash(password, saltRounds)
			resolve(await db.collection("users").insertOne(
				{"username" : username, "password" : hashed}
			))
		} else{
			reject(new Error("User already exists."))
		}
	})
}

exports.login=(username, password)=>{
	return new Promise(async (resolve, reject)=>{
		await promiseWhen(()=>db)
		let user = await exports.get(username)
		if(user!=null){
			var correct = await bcrypt.compare(password, (user.password))
			if(correct){
				resolve()
			} else {
				reject(new Error("Incorrect username or password."))
			}
		} else {
			reject(new Error("No such user registered."))
		}
	})
}

exports.remove=(username)=>{
	return new Promise(async (resolve, reject)=>{
		await promiseWhen(()=>db)
		await db.collection("users").remove({"username" : username})
		resolve()
	})
}


exports.list=()=>{
	return new Promise((resolve, reject)=>{
		promiseWhen(()=>db)
		.then(()=>{
			db.collection("users").find({}).toArray()
				.then(resolve)
				.catch(reject)
		})
		.catch(reject)
	})
}