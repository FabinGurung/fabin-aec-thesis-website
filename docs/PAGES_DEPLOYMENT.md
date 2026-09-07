# Solver-only GitHub Pages deployment

Target repository: `FabinGurung/fabin-aec-thesis-website`

Target branch: `structural-analysis-solver-v0.1`

Publication model: new orphan branch containing only the exact frozen solver-pages payload. Existing branches (`main`, `structural-analysis-demo-v1`, and other thesis branches) are not modified.

After the branch is independently verified, GitHub Pages may be configured to serve `/` from `structural-analysis-solver-v0.1`. This changes the repository's single Pages deployment source but does not alter the preserved source branches. If the existing live thesis Pages deployment must remain continuously available, use a separate repository or later integrate this solver route into the existing Pages branch instead of changing the Pages source.
