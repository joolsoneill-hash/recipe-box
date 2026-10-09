// Fails (exit 1) if the app's script has a syntax error. Usage: node tools/check.js
const h = require('fs').readFileSync('index.html', 'utf8');
const scripts = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if(!scripts.length){ console.error('no script found'); process.exit(1); }
let bad = 0;
scripts.forEach((m, i) => { try { new Function(m[1]); } catch(e){ console.error('script ' + i + ': ' + e.message); bad++; } });
if(h.includes('__APP_VERSION__') || h.includes('__LOGO_SVG__')){ console.error('placeholder left in index.html'); bad++; }
process.exit(bad ? 1 : 0);
