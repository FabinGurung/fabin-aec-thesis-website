# AEC Structural Solver — Integrated Thesis Route v0.1.0

A self-contained, public-safe structural-analysis sub-application published under `public/structural-demo/` inside the Fabin AEC Thesis website. It is derived from the independently verified Step-14 solver package.

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

## Thesis-site integration

The app is published as the static route `/structural-demo/` from the existing thesis GitHub Pages build. The parent Next.js application links to it from both the primary navigation and the overview route cards. All runtime assets use relative URLs, so the sub-application remains portable under the repository Pages base path.

## Boundary

Research demonstrator only. See `docs/VALIDATED_SCOPE.md` and `docs/PUBLICATION_BOUNDARY.md`.
