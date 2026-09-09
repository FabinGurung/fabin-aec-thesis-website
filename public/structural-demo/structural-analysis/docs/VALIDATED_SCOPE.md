# Validated scope

## Included

1. **Moment distribution** — explicit sequential balancing, source-precision distribution factors, carry-over and release handling for the frozen validation profiles.
2. **2D direct stiffness** — first-order linear elastic Euler-Bernoulli frame members, prismatic properties, nodal loads, `ux/uy/rz` DOFs.
3. **Hand EFM reproduction** — only the governed FLOOR-01 arithmetic path used in validation.
4. **Load combinations** — deterministic enumeration of the limited governed LC-01 equation family.
5. **Spectrum post-processing** — global scaling and orthogonal SRSS only.

## Excluded

General shell FE, unrestricted 3D FE, member-load handling in the direct-stiffness module, releases in the direct-stiffness module, shear deformation, nonlinear response, eigen/modal extraction, spectrum interpolation, CQC, complete RC design, and full ETABS-equivalent analysis.

The capability boundary is part of the research result and should not be widened without a new benchmark and freeze.
