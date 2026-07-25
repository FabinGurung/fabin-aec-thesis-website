# Data Source Map

## Source-of-truth priority

1. `data/website_demo_data.json` — verified numerical values and public database-output records
2. `data/thesis_content.json` — summarized research narrative, conclusions and scope guardrails
3. `data/references.json` — cited bibliography in compiled-thesis order
4. Cleaned thesis source used during the original content preparation
5. `public/evidence/*.png` — sanitized supporting evidence only

`data/system_graph.json` is a curated navigation and relationship-visualization layer. It maps approved concepts to routes and source references; it is not a replacement source for engineering values or a complete relational schema.

## Local data files

| File | Imported by | Purpose |
|---|---|---|
| `data/website_demo_data.json` | `components/data.ts` | Database counts, structural model, shared dimensions, joint/member summaries, MDM trace and health checks, 52 diagram points, architecture lines, quantities, delivery rows, method steps, clauses and ten work-item links |
| `data/thesis_content.json` | `components/data.ts` | Metadata, abstract, problem, five research questions, objectives, methodology, results summary, conclusions, limitations, recommendations, future scope and truth guardrails |
| `data/references.json` | `components/data.ts` | 26 public bibliography entries shown on `/thesis` |
| `data/system_graph.json` | `components/system-graph.tsx` | Curated 15-node System Graph, 65-node Database Graph, 106 labelled relationships, groups, categories, statuses, routes and source mappings |

No CSV file is imported by this release. CSV support must not be implied. Any future CSV must be approved, public-safe, deterministic, documented here and covered by verification before use.

## Data-to-route map

| Route | Primary source keys/assets | Rendering files |
|---|---|---|
| `/` | thesis metadata/guardrails; `database_summary`, `member_summary`, `diagram_points`, `quantity_total` | `app/page.tsx` |
| `/research` | problem, questions, objectives, research design, methodology stages, limitations | `app/research/page.tsx` |
| `/system` | `database_summary`, `shared_dimensions`; approved architecture/relationship labels | `app/system/page.tsx`, `components/visuals.tsx` |
| `/prototype` | `structural_model`, `shared_dimensions`, `member_summary`, `joint_summary`, `health_check`, `diagram_points`, `calculation_trace` | `app/prototype/page.tsx`, `components/visuals.tsx` |
| `/workflow` | `architecture_lines`, `quantity_estimates`, `quantity_total`, `work_item_links`, `method_statement_steps`, `specification_clauses`, `delivery_package` | `app/workflow/page.tsx`, `components/visuals.tsx` |
| `/evidence` | `public/evidence/*.png`; captions defined in the route | `app/evidence/page.tsx` |
| `/roadmap` | limitations, recommendations, future scope and truth guardrails | `app/roadmap/page.tsx` |
| `/thesis` | metadata, abstract, keywords, conclusions and references | `app/thesis/page.tsx` |
| `/graph` | graph nodes, edges, groups, route/source mappings; thesis/demo data referenced by selected-node metrics | `app/graph/page.tsx`, `components/system-graph.tsx`, `components/graph-details-panel.tsx` |

## Graph source mapping

| Graph concern | Source | Renderer |
|---|---|---|
| Node label, category, status, shape, route and source reference | `data/system_graph.json` node records | `components/system-graph.tsx` |
| Relationship label, direction and relationship type | `data/system_graph.json` edge records | `components/system-graph.tsx` |
| Database groups and collapsed/expanded state labels | `data/system_graph.json` groups | `components/graph-controls.tsx`, `components/system-graph.tsx` |
| Status/shape legend | graph schema/status vocabulary | `components/graph-legend.tsx` |
| Selected-node description and connected-node cards | selected graph node and its direct edge records | `components/graph-details-panel.tsx` |
| Selected-node verified metric values | approved local metric mapping to `data/website_demo_data.json` | `components/graph-details-panel.tsx` |
| Accessible relationship fallback | same currently visible graph edge records used by SVG | `components/system-graph.tsx` |

Node positions, zoom, pan and force-simulation state are presentation state only. They must never be cited as thesis findings.

## Generated technical visuals

| Visual | Component | Inputs |
|---|---|---|
| A-B-C beam | `BeamDiagram` | `structural_model.members`, `shared_dimensions` |
| BMD | `DiagramChart` with `type="BMD"` | 26 BMD rows in `diagram_points` |
| SFD | `DiagramChart` with `type="SFD"` | 26 SFD rows in `diagram_points` |
| Architecture line view | `ArchitectureLineDiagram` | two rows in `architecture_lines` |
| System implementation boundary | `SystemArchitectureDiagram` | approved architecture labels and explicit status boundary |
| Simplified relationship map | `SimplifiedRelationshipMap` | approved core domains; explicitly not a complete 76-object ERD |

## Public evidence assets

| File | Gallery meaning |
|---|---|
| `element_work_item_linkage_output.png` | Ten explicit element/work-item links |
| `supabase_sql_editor_query.png` | Verified public database counts |
| `supabase_table_view_list.png` | Public database object inventory |
| `v_shared_element_dimensions_output.png` | Shared coordinates and dimensions |
| `v_mdm_member_summary_output.png` | MDM final member moments and reactions |
| `v_mdm_joint_summary_output.png` | MDM joint-level summary |
| `v_mdm_health_check_output.png` | MDM convergence and health checks |
| `v_mdm_diagram_points_output.png` | BMD/SFD point evidence |
| `v_arch_plan_line_elements_output.png` | Architecture line elements |
| `v_estimate_beam_concrete_volume_output.png` | Beam concrete quantities |

The evidence route provides no thesis or defense PDF download.

## Update safeguards

- Do not add credentials, internal UUIDs, browser/dashboard paths, roles, hosted project references or private Supabase metadata.
- Do not infer an MDM Step 6; preserve authoritative trace orders 1, 2, 3, 4, 5 and 7.
- Keep any future partial export explicitly labelled partial.
- Keep the relationship diagram simplified and the System Graph curated; neither is a complete 76-object ERD.
- Keep implemented, validated, framework-level and future-work statuses distinct.
- Preserve 15 System nodes, 65 Database nodes and 106 labelled relationships unless a separately approved data revision intentionally changes the regression baseline.
- Regenerate and verify `MANIFEST.json` after every approved source or asset change.

## GitHub Pages Hosting Files — v2.1

| File | Purpose |
|---|---|
| `.github/workflows/deploy-pages.yml` | Clean install, verification, static build, artifact upload and Pages deployment |
| `next.config.ts` | Enables static export, trailing-slash route files and repository base-path handling |
| `vite.config.ts` | Runs Vinext prerendering without a production server adapter |
| `components/site-path.ts` | Prefixes internal routes and public assets for a GitHub project-site URL |
| `public/.nojekyll` | Prevents GitHub Pages/Jekyll from filtering generated assets |
| `scripts/verify-github-pages.mjs` | Source-level hosting, route, graph and workflow checks |
| `scripts/verify-pages-output.mjs` | Verifies generated HTML for all nine routes and base-path safety |
| `GITHUB_PAGES_SETUP.md` | Browser-only repository creation, deployment, update and rollback guide |

The authoritative thesis and graph data remain under `data/`; the GitHub Pages files change only how the website is built and hosted. The build output under `dist/client` is generated and is not the preferred editing source.
