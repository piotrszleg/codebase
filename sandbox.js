(async function testAccounts(){
  var posts = require("./posts");
  var parser = require("./parser");
  console.log(await posts.get("5b00d8d5baeb7421b8ecf577"));
})();