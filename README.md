# REAL OR AI?

Event booth game: guests look at a photograph and decide whether it is a **real photo** or **AI-generated**.

## Run

```bash
npm install
npm run download-backups
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`download-backups` stores 60 emergency images under `public/backup-images/` (30 real from Wikimedia Commons, 30 photorealistic AI images). The live game still tries online sources first.

## Optional API keys

Copy `.env.example` to `.env.local`:

- `PEXELS_API_KEY` — preferred real photos
- `UNSPLASH_ACCESS_KEY` — fallback real photos
- `AI_IMAGE_API_KEY` / `AI_IMAGE_API_URL` — optional OpenAI-compatible image API
- `SIGHTENGINE_API_USER` / `SIGHTENGINE_API_SECRET` — optional Sightengine AI-image detection; when set, selected images are checked with its `genai` model
- `IMAGE_PROXY_SECRET` — encrypts image tokens so the browser URL does not reveal the answer

Without keys, the game uses Wikimedia Commons for real photos and a photorealistic image model for AI photos. If the network fails, it continues with local backups.

When Sightengine is configured, both credentials are required. Images with an AI-generated probability of 0.5 or higher are treated as AI-generated; images below 0.5 are treated as real. Sightengine errors are reported instead of silently assigning an unverified answer.
