const fs = require('fs');
const html = fs.readFileSync('temp2.html', 'utf8');

// Look for anything that looks like JSON data or endpoints
const urls = html.match(/https?:\/\/[a-zA-Z0-9.\/-]+\.json/g) || [];
console.log("JSON URLs:", [...new Set(urls)]);

// Extract any inline window variables
const scriptMatches = html.match(/<script>window\..+?<\/script>/g) || [];
scriptMatches.forEach((s, i) => {
  fs.writeFileSync(`script${i}.txt`, s);
});
console.log(`Found ${scriptMatches.length} inline scripts`);
