// Copies three.js and the Baloo 2 font from node_modules into www/lib,
// so the game works fully offline inside the app.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), lib = path.join(root, 'www', 'lib');
fs.mkdirSync(path.join(lib, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(root, 'node_modules/three/build/three.min.js'), path.join(lib, 'three.min.js'));
const fontDir = path.join(root, 'node_modules/@fontsource/baloo-2');
fs.cpSync(path.join(fontDir, 'files'), path.join(lib, 'fonts/files'), { recursive: true });
let css = '';
for (const w of ['500', '700', '800']) css += fs.readFileSync(path.join(fontDir, w + '.css'), 'utf8') + '\n';
fs.writeFileSync(path.join(lib, 'fonts/baloo2.css'), css);
console.log('Copied three.js and Baloo 2 into www/lib');
