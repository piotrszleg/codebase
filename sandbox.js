var accounts = require("./accounts");

(async function(){
  try{
    console.log(await accounts.list());
  }catch(err){
    console.log(err);
  }
})();