# Authoritative source map

The project was rebuilt from the supplied cleaned evidence package. Raw/private
historical screenshots are not included.

| Website fact or feature | Authoritative supplied source | Site representation | Status |
|---|---|---|---|
| Thesis title, author and research framing | Cleaned thesis source | `model.meta`, public copy | Verified |
| A/B/C coordinates, AB/BC connectivity, section and EI | Shared element dimensions export | `points`, `elements`, `sections`, `elementProperties` | Verified |
| Loads, final moments and reactions | MDM member summary export | `loads`, `verificationBaseline` | Verified |
| Joint equilibrium | MDM joint summary and health-check exports | integrity and engineering summary | Verified |
| MDM trace sequence 1,2,3,4,5,7 | MDM calculation trace export | `solveCases`, calculated trace | Verified |
| 52 exported BMD/SFD diagram records | MDM diagram points export | validation baseline | Verified |
| Continuous BMD/SFD values between source points | Structural equations evaluated from verified inputs | engineering diagrams | Derived from verified inputs |
| Zero AFD | Absence of axial loading in the verified load case | AFD diagram | Derived from verified inputs |
| Architecture A–B–C lines | Architecture line-element export | data-driven plan and schedule | Verified |
| Concrete quantities | Beam concrete quantity export | `quantities` and construction table | Verified |
| Five work links per beam | Element–work-item link export | `elementWorkLinks` | Verified |
| Six method-statement steps | Method-statement steps export | `methodTemplates` | Verified |
| Five specification clauses | Specification clauses export | `specificationTemplates` | Verified |
| Grid names, Grid 2, columns, slab, transverse beams | No verified supplied source | model-viewer extension | Illustrative |
| 3.00 m viewer level | No verified thesis result | configurable viewer elevation | Illustrative |
| Activity order | Demonstration workflow only | construction relationship strip | Illustrative |
| GIS location/map | No verified site coordinate | omitted; framework boundary stated | Unknown / not implemented |

## Reconciliation rule

When multiple supplied representations differed, the cleaned V2 evidence
package and exact verified exports were used over archive timestamps or older
screenshots. The site does not treat a screenshot as database evidence.

## Public-release rule

Detailed local file-system paths, dashboard URLs, internal identifiers and raw
private screenshots are intentionally excluded. Public source labels describe
the evidence class without revealing workstation or service metadata.

