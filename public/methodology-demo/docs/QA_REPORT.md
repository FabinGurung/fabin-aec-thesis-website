# QA report

Date: 2026-07-27  
Release candidate: v1.0.0

## Outcome

The static repository passed numerical reconciliation, referential integrity,
JavaScript syntax, path-safety, clean-file, responsive, semantic and production
build checks. Live Chrome inspection found one graph Reset regression; it was
fixed and the panned viewBox was then confirmed to return exactly to its
baseline.

## Evidence reconciliation

The canonical model was compared directly with the cleaned supplied exports.

| Check | Result |
|---|---|
| Point coordinates, element connectivity, section and EI | Exact match |
| Member length, UDL, final moments and reactions | Exact match |
| Beam concrete quantities | Exact match |
| Element–work-item links | 10/10 present |
| Method-statement fields | Exact six-step match |
| Specification fields | Exact five-clause match |
| MDM source sequence | 1, 2, 3, 4, 5, 7 preserved |

## Independent engineering checks

| Check | Result |
|---|---:|
| \(L_{AB}\), \(L_{BC}\) from point coordinates | 6.000 m each |
| \(K=4EI/L\) | 16,666.667 kN·m/rad each |
| Joint B distribution factors | 0.500 / 0.500 |
| AB fixed-end moments \(±wL^2/12\) | −30.000 / +30.000 kN·m |
| Final AB moments | −37.500 / +15.000 kN·m |
| Final BC moments | −15.000 / −7.500 kN·m |
| Joint B final imbalance | 0.000 kN·m |
| AB vertical equilibrium | 38.750 + 21.250 = 60.000 kN |
| BC vertical equilibrium | 1.250 − 1.250 = 0.000 kN |
| AB BMD equation | \(M=-37.5+38.75x-5x^2\) |
| AB maximum sagging moment | +37.578 kN·m at x=3.875 m |
| AB SFD | \(V=38.75-10x\) kN |
| BC BMD / SFD | Linear / constant +1.250 kN |
| AFD | 0 kN, derived from no axial load |
| Concrete | 0.621 m³ each; 1.242 m³ total |

The optional test `node tests/model-integrity.test.cjs` reports 29/29 model
integrity checks and verifies the baseline plus an 8.00 m sandbox propagation
case.

## Functional browser checks

| Area | Live check | Result |
|---|---|---|
| Initial load | All sections, tables and seven SVG outputs rendered | Pass |
| Deep navigation | `#engineering` navigation and mobile menu auto-close | Pass |
| Graph global/local | Mode change and enabled depth control | Pass |
| Graph depth | Depth 3 produced 28 nodes and 53 visible relations | Pass |
| Graph search | “Beam BC” selected the canonical BC entity | Pass |
| Cross-view selection | Hero, selection status, graph inspector, Architecture and lineage changed to BC; all remaining modules subscribe to the same tested store | Pass |
| Graph filter | Engineering filter retained shared context and engineering nodes | Pass |
| Graph zoom/fit | ViewBox changed on zoom and returned on fit | Pass |
| Graph pan/reset | Pointer pan changed viewBox; corrected Reset restored `-50 -11 1100 642` exactly | Pass |
| Text alternatives | Graph and structural-viewer alternatives present in the accessibility tree | Pass |
| Structural viewer | Initial plan, layers, selected beams and illustrative labels rendered; elevation/3D and camera/layer handlers inspected | Pass |
| Engineering | MDM trace and BMD/SFD/AFD rendered with equations, units and point labels | Pass |
| Construction | Quantities, five links, method panel and illustrative no-duration sequence rendered; tab semantics and handlers inspected | Pass |
| Sandbox | Runtime change propagation and reset-to-baseline logic tested in Node | Pass |

The live browser policy stopped accepting further local-page actions late in the
session, after the desktop/mobile render, responsive suite and graph interaction
suite were complete. Consequently, every viewer layer and document tab was not
clicked separately in Chrome; their rendered initial states, event bindings,
central-store subscriptions and static/runtime outputs were inspected instead.

## Responsive checks

A same-origin responsive harness loaded the exact repository `index.html`
inside viewports with the following CSS dimensions:

| Viewport | Page overflow | Navigation | Graph/viewer | Tables | Effective target check |
|---|---|---|---|---|---|
| 1440×900 | None | Desktop | Full | Desktop layout | ≥30 px |
| 1024×768 | None after correction | Desktop | Full | Internal scroll only where required | ≥30 px |
| 768×1024 | None after correction | Collapsible | Full-width | Contained | ≥30 px |
| 430×932 | None | Collapsible | 490/420 px canvases | Contained horizontal scroll | ≥30 px |
| 390×844 | None | Collapsible | 490/420 px canvases | Contained horizontal scroll | ≥30 px |
| 375×812 | None | Collapsible | 490/420 px canvases | Contained horizontal scroll | ≥30 px |
| 320×568 | None | Collapsible | 460/390 px canvases | Contained horizontal scroll | ≥30 px |

The 390 px mobile hero and the desktop hero/graph were also visually inspected.
Long technical tables scroll within `.table-scroll`; they do not widen the page.

## Accessibility checks

- One H1 and no heading-level skips in any requested viewport
- 108 unique static HTML IDs
- All static `aria-controls` / `aria-labelledby` and hash targets resolve
- Visible keyboard focus styles for controls, summaries and graph/model nodes
- Keyboard graph selection and directional focus movement
- Button alternatives for graph/model drag and zoom operations
- Roving `tabindex` and arrow-key operation for document tabs
- Live regions for selection, viewer and sandbox states
- Non-color symbols and text for verified/derived/illustrative states
- `prefers-reduced-motion` support
- Effective interactive targets measured at 30 px or more

## Static/public-release checks

- `index.html` exists at repository root.
- All 19 runtime asset references are relative and resolve.
- No runtime `fetch`, API, backend, environment variable or npm dependency.
- No root-relative project assets.
- No credential, private key, service-project URL, UUID-like project
  reference, local workspace path or private dashboard data.
- No site-runtime localhost or absolute web URL.
- `.nojekyll` is present.
- JavaScript syntax checks and CSS brace-balance checks pass.
- Clean extraction is tested again after ZIP creation.

## Intended limitations

- No production database or PostGIS connection
- No verified site coordinate or GIS map
- No IFC import/export or IFC-conformance claim
- No reinforcement mass or formwork area
- No detailed reinforcement design
- No verified construction activity durations
- Illustrative building-frame context is not a validated structural model

These are deliberate evidence boundaries, not missing values silently replaced
with invented content.

