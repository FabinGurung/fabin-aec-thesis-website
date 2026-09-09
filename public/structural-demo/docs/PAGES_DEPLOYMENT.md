# Structural Solver — Thesis Pages Integration

This solver is deployed as a static sub-application at `public/structural-demo/` in the thesis repository.

## Runtime URL

The generated Pages site serves it at `<project-base>/structural-demo/`.

## Publication model

1. Google Drive stores and freezes the exact integration overlay.
2. Colab clones the locked `structural-analysis-demo-v1` baseline commit.
3. Colab overlays only the frozen Drive payload, reruns QA/build checks, and commits with no force.
4. Independent GitHub readback verifies the changed tree.
5. A later governed promotion can move the verified structural branch into the live Pages branch.

The solver does not require a server, database, secret, or private Drive file at runtime.
