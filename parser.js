/*
Turns mustache.js template files into web pages using provided data.
*/

var fs = require('fs');
var mustache = require("mustache");

var builtins={
    "head" : "components/head.html",
    "header" : "components/header.html",
    "footer" : "components/footer.html"
};

var readTemplateFile=(filename, callback)=>{
    fs.readFile("templates/"+filename, {encoding: 'utf-8'}, function (err,data) {
        if (err) {
           console.log(err);
           callback(null);
       }
       callback(data);
    });
};

var parseFile=(filename, view, callback)=>{
    
    fs.readFile("templates/"+filename, {encoding: 'utf-8'}, function (err,data) {
        if (err) {
             console.log(err);
            callback(null);
        }
        callback(mustache.render(data, view));
    });
};

var parseBuiltins=(view)=>{
    var parsedBuiltins=new Map();
    var result={};
    Object.keys(builtins).forEach((key)=>result[key]=mustache.render(builtins[key], view));
    return result;
    
}

exports.run=(filename, view, callback)=>{
    parseFile(filename, Object.assign(parseBuiltins(view), view), callback);
};

// get builtins from files
Object.keys(builtins).forEach((key)=>{
    readTemplateFile(builtins[key], (result)=>{
        builtins[key]=result;
    });
});