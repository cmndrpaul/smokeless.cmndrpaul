import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../',import.meta.url));
const out = join(root,'dist');
mkdirSync(out,{recursive:true});
for (const file of ['index.html','404.html','styles.css','preferences.js','calculator.js','translations.js','script.js','_headers','robots.txt','assets']) {
  cpSync(join(root,file),join(out,file),{recursive:true});
}
console.log('Static website ready in dist/. No dependencies or server functions.');
