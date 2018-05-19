var accounts = require("./accounts");

(async function(){
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
})();