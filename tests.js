var posts = require("./posts");
var fs = require('fs');

// supported posts related functions
/*posts.get(1, (result)=>console.log(result));
posts.edit(1, {title:"tesst", text:"test test"}, (result)=>console.log(result));
var id=posts.create({title:"2nd paste", text:"example text", owner:"admin"}, (result)=>console.log(result));
posts.getAll((result)=>console.log(result));
posts.delete(id, (result)=>console.log(result));
posts.getAll((result)=>console.log(result));*/

posts.getAll((result)=>console.log(result));