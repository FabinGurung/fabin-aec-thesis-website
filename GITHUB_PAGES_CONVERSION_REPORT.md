# GitHub Pages Conversion Report

## Source lineage

Input archive:

`fabin-aec-thesis-website-source-v2-with-system-graph.zip`

Verified input SHA-256:

`d4c5f1f1c1dde7a36c38dfdcf023632397c6f15ae11eac84562fd059a56a29a0`

The input was the validated Version 2 source containing nine routes, 15 System Graph nodes, 65 Database Graph nodes and 106 labelled relationships.

## Hosting decision

The project remains Vinext + React + TypeScript. It was not rewritten as one large `index.html` because the existing component/data structure is safer and easier to edit. `output: "export"` generates the actual deployable HTML, CSS, JavaScript and route folders automatically.

GitHub Actions performs the temporary Node.js build. GitHub Pages serves only `dist/client`; no application server remains running.

## Changes made for GitHub Pages

- Added static-export, trailing-slash and repository-aware base-path configuration.
- Removed the Cloudflare/Worker adapter, Cloudflare Vite plugin, Wrangler dependencies and Wrangler configuration from this edition.
- Added repository-aware path handling for navigation, route cards, graph route links, logo and evidence files.
- Added `.github/workflows/deploy-pages.yml` using GitHub's Pages deployment actions.
- Added `.nojekyll` and generated-output verification.
- Added browser-first setup, update and rollback documentation.
- Replaced the misleading visible phrase `Private static preview` with `Static thesis website`.
- Retained `robots: noindex`; this is not access control.

## Protected data verification

These authoritative files are byte-for-byte unchanged from the Version 2 input:

| File | SHA-256 |
|---|---|
| `data/thesis_content.json` | `53ab4dc9a99c4061ceb7b6ab2387789c7e65c338213059b5c0980e95c38b0549` |
| `data/website_demo_data.json` | `df684baa7ed1adae889d9a647c5b164703f7bc35f89744f347c0ff1ab554209c` |
| `data/references.json` | `f9c54c80f0356cebe41ac7dad2a2387d4ccec8c6b29dc929a1c98a4911ce2898` |
| `data/system_graph.json` | `bbab2c692483f7f1d0958653d954515252c9565bef5ec7cd638124320739aebd` |

## Verification completed in this workspace

Passed:

- content/data regression verification;
- 76 database-object inventory check;
- 52 diagram-point check;
- 10 evidence-PNG check;
- 10 work-item-link check;
- preserved MDM trace orders 1, 2, 3, 4, 5 and 7;
- 80-node and 106-edge graph verification;
- security scan for secrets, credentials, UUIDs, project paths, analytics and database bindings;
- GitHub Pages source/workflow checks;
- portable-package structure checks;
- protected-data checksum comparison.

## Clean build boundary

This execution environment could not complete `npm ci` because it could not reach the package registry. Therefore, the final dependency installation, TypeScript 7.0.2 check, Vinext build and generated-route verification are intentionally enforced by the included GitHub Actions workflow on the first repository upload.

A deployment occurs only after those steps pass. If the build fails, GitHub Pages is not updated; inspect the failed Actions step, correct it, and rerun the workflow.

## Expected deployment

Recommended repository:

`fabin-aec-thesis-website`

Expected standard project URL:

`https://YOUR-USERNAME.github.io/fabin-aec-thesis-website/`

GitHub repository settings must use:

`Settings → Pages → Source → GitHub Actions`
