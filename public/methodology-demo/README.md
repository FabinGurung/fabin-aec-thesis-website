# Shared AEC Data Methodology Demonstrator

An interactive, source-backed companion to Fabin Gurung's MSc Structural
Engineering research at Pokhara University:

> *Design and Implementation of a Normalized Relational Database System
> Integrating BIM and GIS for Automated Building Design and Construction
> Workflow Automation in Nepal*

The demonstrator answers one focused question: how can one canonical element
record be reused by Architecture, Engineering and Construction without
re-entering the same geometry and identity in each workflow?

## What the demonstrator includes

- A data-generated global/local relationship graph with depth, search, filters,
  selection, keyboard access, zoom, pan, fit and reset.
- One shared element selection state across the graph, canonical record,
  plan/schedule, structural viewer, MDM trace, engineering diagrams,
  construction records and lineage.
- Separate plan, elevation and three-dimensional structural projections,
  generated from the canonical point and element records.
- A deterministic two-span Moment Distribution Method solver and engineering
  BMD/SFD/AFD diagrams.
- Source-backed concrete quantities, element–work-item links, method-statement
  steps and specification clauses.
- A reversible sandbox showing how changing a copy of Beam AB's length
  propagates to geometry, stiffness, fixed-end moments and concrete volume.

This is a methodology and verified-results demonstrator. It is not a production
BIM authoring tool, GIS, structural-design package, live database, full BOQ or
construction scheduling application.

## Verified sample

The controlled sample has points A=(0,0,0), B=(6,0,0) and C=(12,0,0), with
two 6.00 m beam elements. Both share a 0.23 m × 0.45 m section and
EI = 25,000 kN·m². Beam AB carries a 10 kN/m UDL; Beam BC has no distributed
load. The verified source results include:

- AB end moments: −37.500 / +15.000 kN·m
- BC end moments: −15.000 / −7.500 kN·m
- AB reactions: 38.750 / 21.250 kN
- BC reactions: 1.250 / −1.250 kN
- Concrete: 0.621 m³ per beam; 1.242 m³ total
- Ten element–work-item links, six method steps per beam and five
  specification clauses per beam

The site distinguishes three evidence classes:

- **Verified** — present in the cleaned supplied evidence.
- **Derived from verified inputs** — deterministic calculations such as the
  continuous diagrams and zero AFD for the verified no-axial-load case.
- **Illustrative** — viewer and workflow extensions, visibly labelled and never
  presented as thesis results.

See [docs/VERIFIED_VS_ILLUSTRATIVE.md](docs/VERIFIED_VS_ILLUSTRATIVE.md) for
the full boundary.

## Repository structure

```text
.
├── index.html
├── README.md
├── CHANGELOG.md
├── LICENSE-NOTE.md
├── .nojekyll
├── css/
├── data/
├── js/
├── docs/
└── tests/
```

`index.html` is the semantic shell. Data values and relations live in
`data/aec-model.js`; source descriptions live in `data/provenance.js`.
`js/data-access.js` creates runtime joins, geometry, quantities and engineering
results. The rendering modules subscribe to one store in `js/store.js`.

For the schema and foreign-key-like references, read
[docs/DATA_MODEL.md](docs/DATA_MODEL.md).

## Preview locally

No installation, build step, backend or network connection is required.

1. Extract the repository.
2. Open `index.html` in a modern browser.

The project uses classic local JavaScript files rather than module imports or
runtime `fetch`, so it also works directly under `file://`.

For an HTTP preview, any static server works:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Edit or extend the data

1. Add or update canonical entities in `data/aec-model.js`.
2. Preserve stable IDs and resolve every reference (`startPointId`,
   `endPointId`, `sectionId`, `elementId`, `workItemId`).
3. Attach a status and source ID to important numerical fields.
4. Add graph nodes and typed relationships as data, not hand-drawn SVG.
5. Run the optional checks:

```bash
node tests/model-integrity.test.cjs
node tests/static-package.test.cjs
```

The renderer code is collection-driven, so more points, beams, properties,
loads and work links can be added without drawing fixed geometry in HTML.

## Publish with GitHub Pages

All asset references are relative and safe under a project subpath such as
`https://USERNAME.github.io/REPOSITORY/`.

1. Create an empty GitHub repository.
2. Upload all extracted files to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/(root)`, then save.

See [docs/GITHUB_PAGES_DEPLOYMENT.md](docs/GITHUB_PAGES_DEPLOYMENT.md) for the
browser-only upload procedure and checks.

## Documentation

- [Data model](docs/DATA_MODEL.md)
- [Source map](docs/SOURCE_MAP.md)
- [Controlled relationship vocabulary](docs/RELATION_VOCABULARY.md)
- [Verified versus illustrative boundary](docs/VERIFIED_VS_ILLUSTRATIVE.md)
- [Research notes](docs/RESEARCH_NOTES.md)
- [QA report](docs/QA_REPORT.md)
- [GitHub Pages deployment](docs/GITHUB_PAGES_DEPLOYMENT.md)

## Public-release note

The repository contains no credentials, private dashboard screenshots, live
database identifiers or runtime API dependency. It deliberately contains no
production site coordinate because none was verified in the supplied evidence.

