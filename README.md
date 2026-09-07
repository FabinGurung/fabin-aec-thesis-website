# AEC Structural Solver — GitHub Pages v0.1.0

A self-contained, public-safe, solver-only JAMstack branch for the Fabin AEC Thesis Structural Analysis Extension.

## Runtime

GitHub Pages serves static HTML/CSS/JavaScript. All solver calculations run in the browser; no backend or database is required.

## Validated capability envelope

- transparent Moment Distribution Method against MDM-01 / MDM-02;
- first-order linear-elastic 2D Euler-Bernoulli direct stiffness against DSF-01;
- FLOOR-01 hand equivalent-frame helpers;
- LC-01 deterministic load-combination enumeration;
- SEIS-01 base-shear scaling and orthogonal SRSS post-processing.

The branch also preserves the corresponding public-safe Python package under `structural-analysis/` for traceability and regression comparison.

## Local QA

```bash
node tests/solver-regression.mjs
python -m pytest -q structural-analysis/tests
```

## Pages

The branch is designed to be published as a standalone GitHub Pages source branch. `index.html` is at repository root and `.nojekyll` is included.

## Boundary

Research demonstrator only. See `docs/VALIDATED_SCOPE.md` and `docs/PUBLICATION_BOUNDARY.md`.
