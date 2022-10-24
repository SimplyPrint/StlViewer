module.exports = new Blob([
    "(" +  require("./worker.js").toString()  + ")((" + require("./parser.js").toString() + ")())"
], {type: 'application/javascript'});
