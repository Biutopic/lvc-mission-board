// Encrypts the Mission Control hub and the LVC board with one password so the public repo only holds ciphertext.
// Usage:  node build.mjs <password> hub=<hub.html> lvc=<board.html>
// Output: app.enc.json  { v:2, salt, iv, ct, built }  — AES-256-GCM over a JSON bundle {hub, lvc}; key from PBKDF2-SHA256 (300k iterations).
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
const subtle = webcrypto.subtle;
const getRandomValues = (u8) => webcrypto.getRandomValues(u8);

const [,, password, ...pairs] = process.argv;
const pages = {};
for (const p of pairs) { const i = p.indexOf('='); if (i > 0) pages[p.slice(0, i)] = readFileSync(p.slice(i + 1), 'utf8'); }
if (!password || !pages.hub || !pages.lvc) { console.error('usage: node build.mjs <password> hub=<hub.html> lvc=<board.html>'); process.exit(2); }

const enc = new TextEncoder();
const plain = enc.encode(JSON.stringify(pages));
const salt = getRandomValues(new Uint8Array(16));
const iv = getRandomValues(new Uint8Array(12));
const base = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 300000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = (u8) => Buffer.from(u8).toString('base64');
writeFileSync('app.enc.json', JSON.stringify({ v: 2, salt: b64(salt), iv: b64(iv), ct: b64(ct), built: new Date().toISOString().slice(0, 10) }));
console.log(`app.enc.json written: ${plain.length} bytes plaintext (${Object.keys(pages).join('+')}) -> ${ct.length} bytes ciphertext`);
