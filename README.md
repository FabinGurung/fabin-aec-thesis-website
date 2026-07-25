# Fabin Gurung AEC Thesis Website — GitHub Pages Edition

Static, independently hostable source for the MSc thesis website:

> **Design and Implementation of a Normalized Relational Database System Integrating BIM and GIS for Automated Building Design and Construction Workflow Automation in Nepal**

- Student: Fabin Gurung
- Registration No.: 2022-1-90-0005
- Programme: Master of Science in Structural Engineering
- University: Pokhara University

This package converts the validated Version 2 ChatGPT Sites source into a GitHub Pages project. The website is built from editable Vinext/React/TypeScript source and deployed as static HTML, CSS, JavaScript and images. It does not need ChatGPT Sites, a Node server, Cloudflare Workers, Supabase, authentication, analytics or secret bindings at runtime.

## Start here

New GitHub users should read **[GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)**. It explains browser-only upload and deployment without VS Code, Jupyter, an IDE or command-line Git.

Recommended repository name:

`fabin-aec-thesis-website`

Expected project-site URL:

`https://YOUR-USERNAME.github.io/fabin-aec-thesis-website/`

## Architecture

```text
Editable repository source
        ↓ push or browser commit
GitHub Actions build
        ↓
Vinext static export in dist/client
        ↓
GitHub Pages
        ↓
Visitor's browser runs the interactive graph
```

The editable repository intentionally remains component-based:

```text
app/                  nine page routes
components/           shared UI, charts and graph components
data/                 public-safe thesis and graph JSON
public/               logo, sanitized evidence and .nojekyll
.github/workflows/    automatic Pages deployment
scripts/              regression and security verification
```

Do not replace this with one large hand-maintained `index.html`. The build automatically produces the deployable `index.html`, route folders and assets while preserving reusable source files.

## Exact toolchain

- Node.js: **24.14.0**
- npm: **11.9.0**
- Vinext: **1.0.0-beta.2**
- React / React DOM: **19.2.7**
- Vite: **8.1.5**
- TypeScript: **7.0.2**

The GitHub Pages edition removes the original Cloudflare adapter, Cloudflare Vite plugin and Wrangler dependencies. The deployed artifact is `dist/client` only.

## Routes

- `/`
- `/research/`
- `/system/`
- `/prototype/`
- `/workflow/`
- `/evidence/`
- `/roadmap/`
- `/thesis/`
- `/graph/`

`next.config.ts` uses `output: "export"`, `trailingSlash: true`, `basePath`. The workflow derives the correct base path from the GitHub repository name, so navigation, evidence images and direct route refreshes work under a project URL.

## Install, verify and build

```bash
node --version
npm --version
npm ci
npm run test:pages
npm run build
npm run verify:pages-output
```

Local development:

```bash
npm run dev
```

Local production preview:

```bash
npm run preview
npm run test:routes
```

For a local project-site simulation:

```bash
NEXT_PUBLIC_BASE_PATH=/fabin-aec-thesis-website npm run build
NEXT_PUBLIC_BASE_PATH=/fabin-aec-thesis-website npm run verify:pages-output
```

## GitHub Pages deployment

`.github/workflows/deploy-pages.yml` runs on every push to `main` and can also be started manually. It uses GitHub's official Pages actions, runs all source checks, builds the static export, verifies all nine generated pages, and deploys `dist/client`.

In the repository, select:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

No GitHub token, password or repository secret is required by the workflow.

## Updating thesis content

- `data/thesis_content.json` — approved research narrative, scope and conclusions.
- `data/website_demo_data.json` — verified public-safe numerical/database output.
- `data/references.json` — displayed references.
- `data/system_graph.json` — curated 15-node System Graph, 65-node Database Graph and 106 relationships.

Do not invent missing results, create an MDM Step 6, or mark framework/future concepts as implemented.

After any approved change:

```bash
npm run verify
npm run verify:security
npm run verify:pages
npm run typecheck
npm run build
npm run verify:pages-output
npm run manifest
npm run verify:manifest
```

## Graph editing

The graph source is `data/system_graph.json`. Types are defined in `components/graph-types.ts`; rendering and interactions are implemented in `components/system-graph.tsx`, `graph-controls.tsx`, `graph-details-panel.tsx` and `graph-legend.tsx`.

For each node, preserve stable IDs, category, implementation status, description, route and source reference. Every edge must point to existing nodes and retain a documented relationship label. The visual graph is curated; it is not a native graph database or complete 76-object ER diagram.

Current release regressions:

- System Graph nodes: **15**
- Database Graph nodes: **65**
- Total nodes: **80**
- Labelled relationships: **106**

## BMD/SFD and evidence

`components/visuals.tsx` renders BMD/SFD charts from all 52 approved diagram-point records in `data/website_demo_data.json`. Sanitized evidence images are under `public/evidence/`; the university logo is under `public/brand/`.

Do not add public PDFs, browser-dashboard captures, credentials, project references, roles, internal UUIDs or unsanitized evidence.

## Public access and indexing

GitHub Pages is public hosting. The application currently retains `robots: noindex` to discourage search indexing, but this is not privacy or authentication. Anyone with the URL may be able to open the website.

## Source integrity

`MANIFEST.json` lists SHA-256 values and byte sizes for portable payload files. Regenerate it only after all edits are complete:

```bash
npm run manifest
npm run verify:manifest
```

The final ZIP checksum is calculated separately.

## Documentation

- `GITHUB_PAGES_SETUP.md` — browser-first repository and Pages instructions
- `GITHUB_PAGES_CONVERSION_REPORT.md` — source lineage, protected-data hashes and verification boundary
- `SITE_ARCHITECTURE.md` — route, rendering and hosting architecture
- `DATA_SOURCE_MAP.md` — source-to-route and graph mapping
- `CHANGELOG.md` — release history
- `MANIFEST_PROCEDURE.md` — checksum procedure
- `SITES_RECONNECTION.md` — historical ChatGPT Sites reconnection boundary for the original source lineage
