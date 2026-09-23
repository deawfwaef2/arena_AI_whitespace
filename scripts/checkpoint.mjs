// Run after each meaningful change. The last complete HTML remains intact if build fails.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
execFileSync(process.execPath,['build.mjs','--production'],{stdio:'inherit'});
await fs.copyFile('build/production/index.html','index.html.next');
await fs.rename('index.html.next','index.html');
console.log('CHECKPOINT: root index.html updated atomically. Double-click to play offline.');
