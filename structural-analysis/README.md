# AEC Structural Analysis — Validated Solver Foundation

This directory is the public-safe computational foundation for the structural-analysis extension of Fabin Gurung's AEC thesis demonstrator.

It publishes **bounded, transparent research code** derived from a privately governed seven-source engineering corpus. The original source binaries, full extraction corpus, private Google Drive evidence, and internal governance records are intentionally not published here.

## Why this exists

The thesis investigates whether a normalized relational building-data model can feed multiple AEC workflows without re-entering the same underlying engineering facts. Before using structural calculations as one of those downstream consumers, the calculation modules were validated against a frozen benchmark suite.

## Validated capabilities

The frozen Step-12 validation suite covers:

- transparent moment-distribution arithmetic against two governed MDM cases;
- first-order linear elastic 2D Euler-Bernoulli direct-stiffness frame analysis;
- bounded hand-equivalent-frame-method reproduction for the governed FLOOR-01 case;
- deterministic load-combination enumeration for the governed LC-01 regression case;
- response-spectrum **post-processing only**: global base-shear scaling and orthogonal SRSS.

All five Step-12 validation batches passed their frozen acceptance gates. See `validation/step12-validation-summary.json`.

## Explicit non-capabilities

This is **not** a substitute for ETABS/SAP2000 or professional structural-design software. The published code does not claim validation for:

- shell finite elements;
- unrestricted 3D frame analysis;
- eigen/modal extraction;
- spectrum interpolation;
- within-direction CQC;
- nonlinear analysis;
- complete reinforced-concrete member design;
- an independent spSlab rerun;
- full ETABS-equivalent building analysis.

## Install and test

```bash
cd structural-analysis
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
python -m pip install --upgrade pip
python -m pip install -e '.[test]'
pytest
```

## Package layout

- `src/aec_structural_validation/` — published solver/processing modules.
- `tests/` — self-contained public regression tests.
- `validation/` — frozen public-safe validation summary and discrepancy record.
- `docs/` — scope, provenance, publication boundary, and research-use notes.

## Validation philosophy

The public tests are intentionally inspectable. They show exact numerical inputs and expected outcomes without reproducing private/copyrighted source documents. The deeper source-faithful evidence chain remains frozen in the governed Drive backend.

## Next stage

A later system-integration supplement will use these already-validated components as one consumer of a normalized 4-column / 4-beam / 1-slab research model. That integration work is additive; it does not rewrite the frozen Step-12 validation foundation.
