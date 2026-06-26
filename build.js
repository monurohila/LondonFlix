const fs = require('fs');
const path = require('path');
const required = ['public/index.html','public/browse.html','public/pricing.html','public/watch.html','public/data/content.json'];
for (const file of required) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`Missing required build file: ${file}`);
    process.exit(1);
  }
}
console.log('LondonStream static OTT build ready in /public');
