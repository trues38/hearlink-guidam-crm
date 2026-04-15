const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = walk('frontend/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match bg-white with a space or quote, but NOT if it already has dark:bg-
  // Also avoid bg-white/40 (has slash)
  const regex = /bg-white([\s"])(?!dark:)/g;
  const newContent = content.replace(regex, 'bg-white dark:bg-slate-900$1');
  
  // also text-slate-800 -> text-slate-800 dark:text-slate-200
  // text-slate-700 -> text-slate-700 dark:text-slate-300
  // border-slate-200 -> border-slate-200 dark:border-slate-700
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
  }
});
