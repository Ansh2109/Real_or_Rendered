const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');
const urls = js.match(/(?:(?:https?:)?\/\/|[\/\.])[^\s\"\']+\.json/g) || [];
console.log("Found JSONs:", [...new Set(urls)]);
