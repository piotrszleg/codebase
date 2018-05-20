async function testAccounts(){
    var accounts = require("./accounts");
    try{
        const test_user={"username" : "test_user", "password" : "test_password"}
        await accounts.remove(test_user.username);
        await accounts.register(test_user.username, test_user.password);
        console.log(await accounts.get(test_user.username));
        console.log((await accounts.list(test_user.username)).length);
        await accounts.login(test_user.username, test_user.password);
        console.log("logged in.");
        await accounts.remove(test_user.username);
        console.log("removed test user.");
        console.log(await accounts.get(test_user.username));
        console.log((await accounts.list(test_user.username)).length);
    }catch(err){
        console.log(err);
    }
    process.exit();
}

async function testPosts(){
    var posts = require("./posts");
    try{
        const test_post={"author" : "test_author", "title" : "test_title", "content" : "test_content"}
        var id=await posts.create(test_post.author, test_post.title, test_post.content);
        console.log(await posts.get(id));
        console.log(await posts.all());
        await posts.edit(id, test_post.author, test_post.title+" edited", test_post.content);
        console.log(await posts.get(id));
        await posts.remove(id);
        console.log("removed the post.");
    }catch(err){
        console.log(err);
    }
    process.exit();
}
testPosts();