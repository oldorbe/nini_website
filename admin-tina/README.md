# Tina CMS Admin (self-hosted on Vercel)

This app is the **Tina CMS** backend and editor for the portfolio site. Content is stored in the **parent repo** at `content/installations.json`, `content/videotapes.json`, and `content/texts.json`. The main site is served by **GitHub Pages** and does not change; edits made here are pushed to GitHub and appear after Pages redeploys.

## Architecture

- **GitHub Pages**: Serves the static site (unchanged; still loads `content/*.json`).
- **This app (Vercel)**: Tina backend + editor; reads/writes the same repo via GitHub Provider.
- **GitHub repo**: Single source of truth for `content/` and the site.

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and set:

- `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH`: The repo that contains `content/` (this repo when using the `admin-tina/` subdirectory).
- `GITHUB_PERSONAL_ACCESS_TOKEN`: GitHub PAT with `repo` scope (read/write contents).
- `NEXTAUTH_SECRET`: e.g. `openssl rand -hex 32`.
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: From [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (required for production).

### 2. First-time login

Default user is in `content/users/index.json`: username **tinauser**, password **tinarocks**. You will be prompted to change the password on first login. See [Tina self-hosted user management](https://tina.io/docs/self-hosted/user-management) to add more users.

### 3. Local development

From `admin-tina/`:

```bash
npm install --legacy-peer-deps   # or: pnpm install
cp .env.example .env
# Edit .env with your values
npm run dev   # or: pnpm dev
```

The first time you build for production (`npm run build`), the Tina CLI will generate `tina/__generated__/` (used by the backend and auth). Local dev does the same on first run.

- **Local mode** (`npm run dev`): Uses local auth and reads content from the filesystem. The folder `admin-tina/content` is a **symlink** to `../content` (repo root) so Tina finds `content/installations.json` etc. If you see "No documents found", create the symlink: `cd admin-tina && ln -snf ../content content`. On Windows, create a junction (`mklink /J content ..\content`) or copy the repo `content/` into `admin-tina/content/`.
- **Production-like** (`npm run dev:prod`): Uses Auth.js and Vercel KV; requires KV and GitHub env vars.

Open [http://localhost:3000](http://localhost:3000) and go to **Open Tina CMS** → `/admin`.

### 4. Deploy to Vercel

1. In Vercel, create a project from this repo.
2. Set **Root Directory** to `admin-tina`.
3. Add all variables from `.env` (including KV and GitHub).
4. Deploy. Then open `https://your-project.vercel.app/admin` to log in and edit.

## Collections

- **Installations**: `content/installations.json` — `projects[]` with id, title, year, images.
- **Videotapes**: `content/videotapes.json` — `projects[]` with id, title, videoUrl, thumbnail, description.
- **Texts**: `content/texts.json` — `entries[]` with id, title, featuredImage, body, attachments.

The JSON shape is fixed so the frontend (GitHub Pages) continues to work without changes.

## Decap CMS

The old `/admin` (Decap) in the repo root is deprecated. Use this Tina app on Vercel as the only content editor to avoid two systems writing the same files.
