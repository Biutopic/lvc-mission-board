# Mission Control · Sea Shepherd France

Prototype of a campaign mission board for **Les Vents de la Colère** (Sea Shepherd France): agenda radar, decisions queue, task board by person, free-time recommender, strategy canvas, project chart with real coastlines, people circle and document hub. Static, no backend. State lives in the browser.

## How the password works

The board itself is **not** in this repository in readable form. `app.enc.json` is the board encrypted with AES-256-GCM, the key derived from the team password with PBKDF2-SHA256 (300 000 iterations). `index.html` asks for the password and decrypts in the browser with WebCrypto. Nothing is sent to a server.

Anyone who has the password sees the full board, so treat the password like the content. The plaintext HTML is never committed (see `.gitignore`).

## Build

```bash
node build.mjs /path/to/lvc-mission-board.html "<password>"
git add app.enc.json && git commit -m "Rebuild board" && git push
```

GitHub Pages serves `index.html` and `app.enc.json` from the `main` branch root.

## Status

The site opens on the Mission Control hub (campaign menu, Media pillar, local groups) and links to each campaign session; Les Vents de la Colère is the first. Build: `node build.mjs <password> hub=<hub.html> lvc=<board.html>`. Prototype maintained by Little Shepherd for the Sea Shepherd France team, September–October 2026. Data seeded from public documents (CNPN opinions, ESCo, court rulings, press) and team notes. Figures marked « à vérifier » are not yet sourced.
