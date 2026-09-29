// Encrypts the mission board HTML with a password so the public repo only holds ciphertext.
// Usage:  node build.mjs <path-to-plaintext.html> <password>
// Output: app.enc.json  { v, salt, iv, ct }  — AES-256-GCM, key from PBKDF2-SHA256 (300k iterations).
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
const { subtle, getRandomValues } = webcrypto;

const [,, src, password] = process.argv;
if (!src || !password) { console.error('usage: node build.mjs <plaintext.html> <password>'); process.exit(2); }

const enc = new TextEncoder();
const plain = readFileSync(src);
const salt = getRandomValues(new Uint8Array(16));
const iv = getRandomValues(new Uint8Array(12));
const base = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 300000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = (u8) => Buffer.from(u8).toString('base64');
writeFileSync('app.enc.json', JSON.stringify({ v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct), built: new Date().toISOString().slice(0, 10) }));
console.log(`app.enc.json written: ${plain.length} bytes plaintext -> ${ct.length} bytes ciphertext`);
