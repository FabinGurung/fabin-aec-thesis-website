# GitHub Pages Setup — Browser-First Guide

This repository is prepared to host the thesis website directly from GitHub Pages. GitHub serves only the generated static HTML, CSS, JavaScript and images. No ChatGPT Sites server, Cloudflare Worker, database or continuously running computer is required.

## Recommended repository

Create a **public** repository named:

`fabin-aec-thesis-website`

The expected address is:

`https://YOUR-USERNAME.github.io/fabin-aec-thesis-website/`

The workflow automatically detects the repository name and configures the correct URL prefix. It also works for a root repository named `YOUR-USERNAME.github.io`, where no prefix is needed.

## Upload through GitHub.com without VS Code

1. Sign in to GitHub and create a new repository.
2. Name it `fabin-aec-thesis-website`.
3. Choose **Public** when using GitHub Free and GitHub Pages.
4. Do not initialise it with a README, licence or `.gitignore`; those files are already included.
5. Extract the supplied ZIP on your computer.
6. Open the extracted folder. Upload its **contents**, so `package.json`, `app/`, `components/` and `.github/` appear at the repository root.
7. On GitHub select **Add file → Upload files** and drag the files/folders into the browser.
8. Commit with: `Initial GitHub Pages import of validated thesis website`.
9. Open **Settings → Pages**.
10. Under **Build and deployment → Source**, select **GitHub Actions**.
11. Open the **Actions** tab and wait for `Build and deploy thesis website to GitHub Pages` to finish.
12. Open the deployment URL shown by the workflow or by **Settings → Pages**.

GitHub may require a verified email address before the first Pages deployment.

## What happens after each update

Every push to the `main` branch triggers `.github/workflows/deploy-pages.yml`:

1. Checks out the source.
2. Uses Node.js 24.14.0 and npm 11.9.0.
3. Derives the GitHub Pages base path from the repository name.
4. Runs `npm ci` from the locked dependencies.
5. Runs content, security, graph and TypeScript checks.
6. Exports all nine routes as static files.
7. Verifies the generated output and route files.
8. Uploads `dist/client` as the Pages artifact.
9. Deploys it to GitHub Pages.

The visitor receives static files. Node.js is used only temporarily during the GitHub Actions build.

## Browser-only updates

Small text, JSON or documentation edits can be made directly on GitHub:

1. Open the file.
2. Select the pencil icon.
3. Make the change.
4. Select **Commit changes**.
5. The deployment workflow runs automatically.

For replacing many files, use **Add file → Upload files**. For frequent development, GitHub Desktop is easier but optional.

## Important public-access warning

A GitHub Pages site is not private merely because its source is academic or because search indexing is disabled. Anyone with the URL may be able to open it. This project retains `noindex` metadata by default, but that is not access control.

Never upload:

- passwords, API keys, access tokens or `.env` values;
- `.openai/hosting.json`;
- private Supabase project references or dashboard paths;
- internal UUIDs;
- unsanitized screenshots;
- confidential thesis or company records.

## Local use

Local development does not use a repository prefix:

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run test:pages
npm run build
npm run verify:pages-output
npm run preview
```

To simulate a project repository locally:

```bash
NEXT_PUBLIC_BASE_PATH=/fabin-aec-thesis-website npm run build
NEXT_PUBLIC_BASE_PATH=/fabin-aec-thesis-website npm run verify:pages-output
```

## Custom domain later

A custom domain can be added through **Settings → Pages**. When using a custom domain at the domain root, build with an empty `NEXT_PUBLIC_BASE_PATH`. The supplied workflow targets the standard GitHub project-site address automatically; document and test any custom-domain change before deployment.

## Rollback

GitHub keeps every commit. To restore an earlier website source state, revert the problematic commit or upload a previously validated source milestone, then let the Pages workflow deploy again. Keep the original Version 1 and Version 2 ZIP files separately as independent backups.
