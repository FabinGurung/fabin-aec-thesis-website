# Changelog

## 2.0.0 — 2026-07-19

Version label: **v2 — Interactive System Graph**

### Interactive graph

- Added the statically prerendered `/graph` route.
- Added System Graph and Database Graph tabs covering 80 total nodes: 15 System nodes and 65 Database nodes.
- Added 106 source-backed labelled relationships.
- Added Global and Local Graph modes with depth controls 1–3.
- Added node search, category filtering, implementation-status filtering and collapsible database groups.
- Added zoom, pan, node dragging, selection, reset and fit-to-view controls.
- Added the source-backed selected-node details panel, connected-node cards, graph legend and complete accessible text relationship fallback.

### Final interface corrections

- Corrected sticky-header and scroll-target offsets at 320, 375, 390 and 430 px widths without changing desktop spacing.
- Replaced the cramped mobile navigation instruction with a dynamic right-edge overflow cue while preserving touch and keyboard scrolling.
- Limited group-expansion hints to hover, focus or selection and added the assistive instruction “Press Enter or double-click to expand this group.”
- Preserved dimmed graph context at opacity `0.30` and enlarged selected/direct-neighbor labels on mobile.
- Prevented selected-edge label collisions with nodes and other prominent labels using deterministic candidate placement, light label backgrounds and leader lines where required.
- Removed duplicate relationship-count wording from connected-node cards.

### Verification and documentation

- Preserved all protected thesis narrative, verified numerical and reference JSON files without changes.
- Preserved the Version 1 ZIP byte-for-byte.
- Added graph regression checks for 15 System nodes, 65 Database nodes and 106 relationships.
- Completed content, security, TypeScript, static-build, nine-route HTTP, desktop browser, mobile browser, keyboard, reduced-motion, overflow, broken-link/image and console/hydration checks.
- Updated the README, architecture, data-source map, manifest procedure and Sites reconnection guidance for the graph release.

## 1.0.0 — 2026-07-19

Portable source baseline for the thesis website before the interactive System Graph.

- Preserved eight static routes, reusable React/Vinext components, responsive styling, local thesis JSON, public-safe evidence PNGs, the university logo and pinned build configuration.
- Preserved the 52-point BMD/SFD dataset, ten-row element/work-item linkage and MDM trace without inventing Step 6.
- Added exact Node/npm metadata, portable checks, route testing, source documentation and a normalized SHA-256 manifest procedure.
- Excluded `.openai/hosting.json`, `.git`, dependencies, build outputs, caches, logs, credentials, private metadata and analytics.

## v2.1 — GitHub Pages Static Export

- Prepared the validated Version 2 source for independent GitHub Pages hosting.
- Preserved all nine routes, 15 System Graph nodes, 65 Database Graph nodes and 106 labelled relationships.
- Added `output: "export"`, trailing-slash routes and repository-aware base-path configuration.
- Added `components/site-path.ts` and applied it to navigation, route cards, graph detail links, logo assets and evidence assets.
- Added an official GitHub Actions Pages workflow that installs Node.js 24.14.0, verifies source, builds static output, verifies all routes and deploys `dist/client`.
- Added `.nojekyll`, GitHub Pages source/output regression scripts and browser-first setup instructions.
- Removed the Cloudflare adapter, Cloudflare Vite plugin, Wrangler dependencies, adapter imports and Wrangler configuration from the GitHub Pages edition.
- Changed visible wording from “Private static preview” to the truthful neutral label “Static thesis website”.
- Preserved `robots: noindex`; this discourages indexing but does not make GitHub Pages private.
- Protected thesis narrative, verified numerical data, references and graph data were not intentionally altered by the hosting conversion.
