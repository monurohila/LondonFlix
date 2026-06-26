const fs = require('fs');
const path = require('path');
const root = __dirname;
const required = ['public/index.html','public/browse.html','public/pricing.html','public/watch.html','public/data/content.json'];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing required build file: ${file}`);
    process.exit(1);
  }
}
const watch = fs.readFileSync(path.join(root,'public/watch.html'),'utf8');
const browse = fs.readFileSync(path.join(root,'public/browse.html'),'utf8');
const pricing = fs.readFileSync(path.join(root,'public/pricing.html'),'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root,'public/data/content.json'),'utf8'));
fs.mkdirSync(path.join(root,'public/api'), {recursive:true});
fs.writeFileSync(path.join(root,'public/api/content'), JSON.stringify(data,null,2));
fs.mkdirSync(path.join(root,'public/browse'), {recursive:true});
fs.writeFileSync(path.join(root,'public/browse/index.html'), browse);
fs.mkdirSync(path.join(root,'public/pricing'), {recursive:true});
fs.writeFileSync(path.join(root,'public/pricing/index.html'), pricing);
const all = [...(data.items||[]), ...(data.upcoming||[]), ...(data.series||[])];
for (const item of all) {
  const dir = path.join(root,'public/watch', item.id);
  fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'), watch);
}
console.log(`LondonFlix V16 build ready. Generated ${all.length} watch routes.`);
