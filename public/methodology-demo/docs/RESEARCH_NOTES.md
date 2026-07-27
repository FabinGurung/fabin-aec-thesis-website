# Research notes

These sources informed interaction, terminology, engineering checks and
deployment. No third-party interface or source code was copied.

## Relational database theory

### E. F. Codd, “A Relational Model of Data for Large Shared Data Banks” (1970)

- Source: [paper copy hosted by the University of Pennsylvania](https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf)
- Applied idea: facts are represented in relations and retrieved through stable
  logical relationships rather than repeated, view-specific files.
- Product decision: one element identity and linked point/property/load/work
  records feed all discipline views.

### E. F. Codd, “Further Normalization of the Data Base Relational Model” (1971)

- Source: [reproduced paper](https://forum.thethirdmanifesto.com/wp-content/uploads/asgarosforum/987737/00-efc-further-normalization.pdf)
- Applied idea: separate facts with different dependencies to avoid update
  anomalies.
- Product decision: points, sections, loads, work items and documents are
  separate collections joined by IDs, not copied inside every beam card.

### PostgreSQL constraints

- Source: [PostgreSQL documentation — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- Applied idea: primary keys identify rows and foreign keys maintain referential
  integrity.
- Product decision: static records use primary-key-like IDs and the repository
  runs equivalent reference checks at load/test time. This is an analogy, not a
  claim that the frontend itself provides database transactions.

## Structural engineering

### ETABS view concepts

- Sources: [CSI ETABS modeling process](https://docs.csiamerica.com/help-files/etabs/Getting_Started/Modeling_Process.htm),
  [types of views](https://docs.csiamerica.com/help-files/etabs/Getting_Started/Types_of_Views.htm),
  [elevation view](https://docs.csiamerica.com/help-files/etabs/Menus/View/Set_Elevation_Views.htm),
  [3D view](https://docs.csiamerica.com/help-files/etabs/Menus/View/Set_3D_View.htm)
- Applied idea: plan, elevation and 3D are separate projections of the same
  object model; display layers and camera controls should not create separate
  geometry sources.
- Product decision: all three projections are rendered from canonical points
  and elements, with explicit controls and verified/illustrative layers.

### Beam load, shear and bending-moment relationships

- Source: [Purdue University structural-analysis notes, Chapter 7](https://engineering.purdue.edu/~aprakas/CE297/CE297-Ch7.pdf)
- Applied idea: distributed load, shear and bending moment are connected by
  differential/equilibrium relationships.
- Product decision: AB BMD is evaluated as a parabola, AB SFD as a line, BC BMD
  as a line and BC SFD as a constant; the old three-point polyline was rejected.
  Final end moments and reactions were independently reconciled with joint and
  member equilibrium.

## BIM / IFC relationship concepts

### buildingSMART IFC 4.3 documentation

- Sources: [spatial containment relationship](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcRelContainedInSpatialStructure.htm),
  [element quantity](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcElementQuantity.htm),
  [process assignment](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcRelAssignsToProcess.htm)
- Applied idea: relationships are first-class records that connect objects to
  spatial structure, quantities and processes.
- Product decision: the graph uses typed edges and join records for
  element–work-item mappings. The demonstrator uses these as conceptual
  guidance only and makes no IFC-conformance claim.

## Graph interaction

### Obsidian Graph View

- Source: [Obsidian Help — Graph view](https://help.obsidian.md/plugins/graph)
- Applied idea: a global graph explains the whole information space while a
  local graph exposes a selected node's neighborhood at adjustable depth.
- Product decision: the demonstrator provides global/local modes, depth 1–3,
  search and filters, plus an inspector and complete text alternative.

## Accessibility

### WCAG 2.2

- Sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
  [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
  [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- Applied idea: interaction cannot depend only on pointer dragging, focus must
  remain visible, and controls need usable targets.
- Product decision: graph/model gestures have button alternatives; nodes and
  controls are keyboard operable; focus and selected states are explicit;
  reduced motion and a screen-readable graph relation list are included.

## Static deployment

### GitHub Pages

- Sources: [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
  [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- Applied idea: a project site can publish from a selected branch and folder.
- Product decision: the repository is no-build, uses relative paths for project
  subpaths, places `index.html` at root and includes `.nojekyll`.

