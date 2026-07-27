# Controlled relationship vocabulary

Graph edges use a small set of directional predicates. Renderers must not replace
them with a vague “related to” label.

| Predicate | Meaning | Example |
|---|---|---|
| `contains` | Parent scope owns or groups a record | project → point |
| `references` | Hub or record points to a canonical entity | shared hub → beam |
| `starts_at` | Element begins at a point | Beam AB → Point A |
| `ends_at` | Element ends at a point | Beam AB → Point B |
| `has_section` | Element uses a section definition | Beam AB → 230×450 section |
| `has_property` | Element owns a linked property | Beam AB → EI |
| `loaded_by` | Load acts on an element | Beam AB → UDL |
| `analyzes` | Solve case includes an element | MDM case → Beam AB |
| `produces` | Process or domain emits an output | solve case → result |
| `has_result` | Element is joined to a result record | Beam AB → Result AB |
| `quantified_as` | Element has a calculated quantity record | Beam AB → concrete quantity |
| `maps_to` | Quantity/classification maps to a work item | quantity → concrete work |
| `mapped_to` | Element participates in a work/document record | Beam AB → formwork |
| `documented_by` | Element is linked to a method statement | Beam AB → method |
| `specified_by` | Element is linked to a specification | Beam AB → specification |
| `represented_in` | Canonical entity is consumed by a view/domain | Beam AB → Architecture |
| `feeds` | Shared hub supplies a discipline domain | hub → Engineering |

Relationships are stored once in `data/aec-model.js`. The global graph, local
neighborhood traversal, inspector and accessible text alternative all consume
the same edge records.

