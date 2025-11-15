<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xM61PBBWqHZNKZP6FwbUGLGTwpsvKSum

## Run Locally

**Prerequisites:** Node.js and npm

1. Install dependencies:

   `npm install`
2. Create a `.env` file in the project root (this repo already expects it) and set:
   - `GEMINI_API_KEY=<your Gemini API key or keys>`
3. Run the app:

   `npm run dev`

The app will be available on `http://localhost:3000`.

## Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages at:

`https://K1tvkli.github.io/DocBlock/`

### One‑time GitHub setup

1. Push this repository to GitHub under the `K1tvkli/DocBlock` repo.
2. In GitHub, go to **Settings → Pages**.
3. Set **Source** to the `gh-pages` branch (it will be created on first deploy).

### Deploy from your machine

1. Make sure your `.env` file contains a valid `GEMINI_API_KEY` so the build can access it.
2. From the project root, run:

   `npm run deploy`

   This will:
   - Run `npm run build` to produce a static bundle in `dist/`.
   - Publish the `dist/` folder to the `gh-pages` branch using `npx gh-pages`.

3. After the command completes, GitHub Pages will pick up the new contents of the `gh-pages` branch. Wait a minute and then open:

   `https://K1tvkli.github.io/DocBlock/`

> **Note:** The `.env` file is ignored by Git (`.env` is in `.gitignore`), so your actual API keys are **not** pushed to GitHub. They are only used at build time on your machine.