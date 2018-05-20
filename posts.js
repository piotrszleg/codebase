var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/codebase";
// get the database object
var db=null;
MongoClient.connect(url)
	.then(function callback(client){db=client.db("codebase")})
  .catch((err)=>{throw err});
  
// returns a Promise that resolves when condition evaluates to non falsy value
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

exports.create=(author, title, content)=>{
	return new Promise(async (resolve, reject)=>{
		try {
      await promiseWhen(()=>db);
        var id = (await db.collection("posts").insertOne(
                {"author" : author, "title" : title, "content" : content})).insertedId;
				resolve(id);
		} catch(err){
			reject(err);
		}
	});
}

exports.edit=(id, author, title, content)=>{
  return new Promise(async (resolve, reject)=>{
		try {
			await promiseWhen(()=>db);
				resolve(await db.collection("posts").updateOne(
          {"_id":id},
					{$set : {"author" : author, "title" : title, "content" : content}}
				));
		} catch(err){
			reject(err);
		}
	});
}

exports.remove=(id)=>{
	return new Promise(async (resolve, reject)=>{
		try {
			await promiseWhen(()=>db);
			await db.collection("posts").remove({"_id" : id});
			resolve();
		} catch(err){
			reject(err);
		}
	});
}

exports.get=(id)=>{
	return new Promise(async (resolve, reject)=>{
		try {
			await promiseWhen(()=>db);
			resolve((await db.collection("posts").findOne(
				{"_id" : id}
			)));
		} catch(err){
			reject(err);
		}
	});
}

exports.all=()=>{
  return new Promise((resolve, reject)=>{
		promiseWhen(()=>db)
		.then(()=>{
			db.collection("posts").find({}).toArray()
				.then(resolve)
				.catch(reject);
		})
		.catch(reject);
  });
}