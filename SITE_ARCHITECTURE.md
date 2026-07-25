# Site Architecture

## Runtime architecture

```text
Local thesis JSON + sanitized public assets
                  |
                  v
     Vinext App Router route modules
                  |
       +----------+-----------+
       |                      |
       v                      v
Static server-rendered pages   Client SVG System Graph
       |                      |
       +----------+-----------+
                  v
       Prerendered production output
```

The website has no application backend and no browser-side data fetch. Thesis narrative, verified numerical values, chart records, graph relationships, source references and evidence captions are bundled at build time. The interactive graph operates entirely on the local curated JSON after hydration.

## Routes

| Route | Source file | Primary responsibility |
|---|---|---|
| `/` | `app/page.tsx` | Overview, thesis identity, verified snapshot and scope boundaries |
| `/research` | `app/research/page.tsx` | Problem, questions, objectives, methodology and validation logic |
| `/system` | `app/system/page.tsx` | Database inventory, shared-data hub, implementation boundary and simplified relationship map |
| `/prototype` | `app/prototype/page.tsx` | A-B-C beam, MDM results, health checks, BMD/SFD and calculation trace |
| `/workflow` | `app/workflow/page.tsx` | Shared coordinates, quantities, work items, method steps, clauses and delivery rows |
| `/evidence` | `app/evidence/page.tsx` | Sanitized public evidence gallery and safety disclosure |
| `/roadmap` | `app/roadmap/page.tsx` | Limitations, recommendations, framework concepts and future work |
| `/thesis` | `app/thesis/page.tsx` | Academic metadata, abstract, conclusions and references |
| `/graph` | `app/graph/page.tsx` | Curated interactive System and Database relationship graphs |

## Shared application structure

### Data layer

- `components/data.ts` imports the three authoritative thesis JSON files and provides presentation-only formatting helpers.
- `data/system_graph.json` is a separate curated visualization dataset. It describes nodes, labelled relationships, sources and graph groups but does not supersede thesis numerical data.

### Site shell and navigation

- `components/ui.tsx` provides the header, page intros, status badges, source disclosures, callouts, cards and footer.
- `components/mobile-navigation.tsx` provides the keyboard-accessible horizontal mobile navigation and dynamic overflow cue without page overflow.

### Technical visuals

`components/visuals.tsx` contains:

- `BeamDiagram` — A-B-C beam generated from supplied spans, dimensions, supports, EI and UDL
- `DiagramChart` — BMD/SFD from all 52 supplied records
- `ArchitectureLineDiagram` — line geometry from supplied coordinates
- `SystemArchitectureDiagram` — implemented functionality separated from framework/future scope
- `SimplifiedRelationshipMap` — explicitly simplified, not a complete 76-object ERD

## Interactive graph component structure

| File | Responsibility |
|---|---|
| `app/graph/page.tsx` | Static route wrapper, interpretation boundary and source disclosures |
| `components/system-graph.tsx` | Client state, derived graph views, SVG rendering, force layout, selection, zoom, pan, dragging, group expansion and accessible fallback |
| `components/graph-controls.tsx` | Tabs, Global/Local modes, depth 1–3, search, category/status filters, group controls, zoom, reset and fit-to-view |
| `components/graph-legend.tsx` | Shape, status and relationship legend plus expandable usage guidance |
| `components/graph-details-panel.tsx` | Selected-node metadata, source reference, related route, verified metrics and connected-node cards |
| `components/graph-types.ts` | Local TypeScript graph schema |
| `data/system_graph.json` | 15 System nodes, 65 Database nodes and 106 total labelled relationships |
| `app/globals.css` | Responsive graph, label, navigation, focus and reduced-motion styling |

### Graph data flow

1. `SystemGraph` imports the local graph JSON during the application build.
2. The selected tab, filters and collapsed groups derive a visible node/edge set without mutating source data.
3. Global mode shows the curated context; Local mode performs bounded neighborhood traversal at depth 1–3.
4. A deterministic seed plus client-side SVG force simulation positions the visible nodes. Layout state changes presentation only.
5. Selection exposes every direct relationship label and populates the source-backed details panel.
6. The relationship list below the SVG renders the complete currently visible labelled edge set as accessible text.

The force simulation performs no engineering calculation and makes no research inference. Reduced-motion mode retains the deterministic seed layout and suppresses nonessential animation.

## Accessibility and responsive behavior

- Every node is keyboard focusable and selectable.
- Expandable database groups announce “Press Enter or double-click to expand this group.”
- The visual graph has a complete text relationship fallback; label decluttering never removes relationship data from that fallback.
- Graph help documents zoom, pan, drag, select, Global/Local mode, search, filtering, depth, reset and fit-to-view.
- Selected and direct-neighbor labels enlarge on mobile; dimmed context remains at opacity `0.30`.
- Sticky-header offsets, focus targets and anchors are adjusted for 320–430 px layouts.
- Mobile navigation uses touch scrolling, left/right keyboard scrolling, focus-visible states and a cue that disappears at the end.

## Static rendering and hosting

- `app/layout.tsx` declares `dynamic = "force-static"`.
- `next.config.ts` enables `output: "export"`, trailing-slash pages, a repository-aware `basePath`.
- `vite.config.ts` enables Vinext with `prerender: { routes: "*" }` and no production server adapter.
- `tsconfig.json` enables strict TypeScript and JSON-module imports.
- `public/.nojekyll` is copied into the deployment artifact.

`npm run build` creates the deployable static website under `dist/client`. The repository does not include a Wrangler configuration, Cloudflare Worker entrypoint, database binding or required runtime environment variable. Generated `dist/` output remains reproducible and excluded from the portable source ZIP.

The original ChatGPT Sites project association is not part of this GitHub Pages edition. `.openai/hosting.json` remains excluded from source control and archives.

## Data and trust boundary

1. `data/website_demo_data.json` is authoritative for verified numerical and exported database content.
2. `data/thesis_content.json` is authoritative for the summarized thesis narrative and scope.
3. `data/references.json` is authoritative for the displayed bibliography.
4. `data/system_graph.json` is authoritative only for the curated graph presentation and its source mappings.
5. Sanitized evidence PNGs support claims but do not replace the underlying database or engineering rules.
6. No live database, API, authentication layer, machine-learning model or browser storage participates in rendering.

## GitHub Pages Static Hosting Layer — v2.1

The GitHub Pages edition is a separate hosting configuration of the validated Version 2 source.

```text
GitHub repository source
  ├─ app/, components/, data/, public/
  ├─ next.config.ts: output export + basePath + trailingSlash
  ├─ vite.config.ts: Vinext prerender only
  └─ .github/workflows/deploy-pages.yml
           ↓ npm ci + verification + build
       dist/client
           ↓ Pages artifact
       GitHub Pages CDN
           ↓
       visitor browser
```

There is no production Node.js process. Node.js and npm are used only during the GitHub Actions build. There is no Cloudflare Worker entrypoint, Wrangler runtime configuration, database, authentication service, secret binding or API route.

`NEXT_PUBLIC_BASE_PATH` is calculated by the workflow. A project repository such as `fabin-aec-thesis-website` is served below `/fabin-aec-thesis-website`; a repository named `<owner>.github.io` is served at the domain root. `components/site-path.ts` prefixes application-owned links and public assets consistently.

The exported route contract uses trailing directories so every route has a static HTML target such as `graph/index.html`. `public/.nojekyll` prevents Jekyll processing of generated assets.
