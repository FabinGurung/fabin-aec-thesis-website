# Changelog

## 1.0.0 — 2026-07-27

Complete rebuild of the corrected prototype as a focused, GitHub Pages-ready
methodology demonstrator.

### Data and provenance

- Replaced repeated UI constants with one canonical normalized frontend model.
- Added stable project, point, section, element, property, load, solve,
  quantity, work-item, document and relationship IDs.
- Added field-level `verified`, `derived_verified`, `illustrative` and
  `linked_only` evidence states.
- Added a public-safe source map and on-load referential-integrity checks.
- Preserved the verified MDM trace sequence exactly as Steps 1, 2, 3, 4, 5 and 7.

### Interaction

- Rebuilt the methodology graph from data with global/local views, relationship
  depth 1–3, search, category filters, node selection, keyboard navigation,
  zoom, pan, fit, reset and a text alternative.
- Added one central selection state so Beam AB or Beam BC is highlighted across
  every discipline view.
- Added a data-generated lineage view and field-consumer matrix.
- Added a reversible change-propagation sandbox.

### Architecture and model viewing

- Replaced the hard-coded architecture SVG with point/element-driven rendering.
- Added separate plan, elevation and isometric projections.
- Added visibility layers, verified-only mode, level-height control, orbit,
  zoom, pan, fit and reset controls.
- Removed frame-base symbols that could be confused with the verified
  fixed–continuous–fixed analytical boundary conditions.
- Marked Grid 1 naming, Grid 2, the 3.00 m storey, columns, transverse beams and
  slab as illustrative.

### Engineering

- Implemented an exact deterministic two-span Moment Distribution Method solve.
- Corrected the UDL field unit to kN/m.
- Corrected the AB BMD from three straight segments to a smooth evaluation of
  \(M(x)=-37.5+38.75x-5x^2\).
- Added engineering-style BMD, SFD and AFD charts with baselines, units,
  end values, extrema, sign convention and point inspection.
- Labelled zero AFD as derived from the verified no-axial-load case rather than
  exported source data.

### Construction

- Rebuilt quantities and work links from element relationships.
- Kept concrete volumes verified while marking rebar and formwork quantities as
  unavailable / linked only.
- Restored the exact supplied six-step method statement and five-clause
  specification.
- Kept downstream activity sequencing illustrative and removed unsupported
  durations.

### Delivery quality

- Added responsive layouts for desktop, tablet and 320–430 px mobile widths.
- Added visible focus, reduced-motion support, semantic controls, non-color
  status labels and an accessible graph fallback.
- Added subpath-safe relative assets, `.nojekyll`, clean repository
  documentation and optional Node-based integrity/static-package tests.

