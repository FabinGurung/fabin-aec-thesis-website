# Verified versus illustrative boundary

The distinction below is a data rule, not merely a color legend.

## Verified from supplied evidence

- Project/sample identifiers and thesis research context
- A=(0,0,0), B=(6,0,0), C=(12,0,0)
- Beam AB and Beam BC connectivity and 6.00 m lengths
- Shared 0.23 m × 0.45 m rectangular section
- EI = 25,000 kN·m² for each beam
- AB UDL = 10 kN/m; BC distributed load = 0
- Fixed–continuous–fixed analytical end-condition description
- AB final moments −37.500 / +15.000 kN·m
- BC final moments −15.000 / −7.500 kN·m
- AB reactions 38.750 / 21.250 kN
- BC reactions 1.250 / −1.250 kN
- Joint B moment imbalance = 0
- Duplicate stiffness locations = 0; solve converged and healthy
- 52 exported BMD/SFD source records
- Concrete volume = 0.621 m³ per beam and 1.242 m³ total
- Five element–work-item links per beam; ten unique links total
- Six method-statement steps per beam
- Five specification clauses per beam
- Source MDM trace sequence 1, 2, 3, 4, 5 and 7

## Derived from verified inputs

- Runtime length calculated from point coordinates
- Stiffness \(K=4EI/L\)
- Fixed-end moments for the verified UDL case
- Distribution factors, balancing and carry-over values
- Continuous BMD/SFD values and AB critical moment location
- Zero AFD for the verified load case, because no axial load is present
- Runtime concrete volume \(L \times b \times D\)

These are deterministic and independently checked but are not described as raw
database exports.

## Verified relationship, quantity unavailable

- Reinforcement work is linked to each beam, but no reinforcement quantity was
  supplied.
- Formwork work is linked to each beam, but no formwork area was supplied.

The construction view states “linked only” rather than inventing kg or m².

## Illustrative methodology extensions

- The names “Grid 1” and “Grid 2”
- Grid 2 and its 4.00 m transverse offset
- Columns, transverse beams and slab
- The configurable 3.00 m viewer level
- The isometric building-frame context
- Downstream activity ordering
- Sandbox values and every result produced while sandbox mode is active

Illustrative geometry uses its own status label and line/fill treatment. Turning
on **Verified only** removes it from the structural viewer.

## Unknown or intentionally omitted

- Production site coordinate
- GIS map/location geometry
- PostGIS layer or live spatial database connection
- IFC import/export and formal IFC conformance
- Reinforcement and formwork quantities
- Detailed reinforcement design
- Production programme durations
- Live backend/database authentication

The research uses BIM/GIS and IFC-oriented relational concepts as framework
guidance. The demonstrator does not claim that the sample dataset is
IFC-compliant.

