var accounts = require("./accounts");

(async function(){
  try{
    console.log(await accounts.get("test", "123"));
  }catch(err){
    console.log(err);
  }
})();