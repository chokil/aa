# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite-based vanilla JS/CSS website (no framework). Single service.

- **Dev server**: `npm run dev` (Vite on port 5173)
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview prod build**: `npm run preview` (port 4173)
- **Deploy**: Vercel（`vercel.json` 参照。`npm run build` → `dist/`）
- Google Fonts are loaded from CDN; offline environments will fall back to system fonts.
