(function () {
  "use strict";

  const datum = (value, unit, status, sourceId, note) =>
    Object.freeze({
      value,
      unit: unit || null,
      status: status || "verified",
      sourceId: sourceId || null,
      note: note || null
    });

  const deepFreeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  };

  const model = {
    meta: {
      schemaVersion: "1.0.0",
      release: "v1.0.0",
      title:
        "Design and Implementation of a Normalized Relational Database System Integrating BIM and GIS for Automated Building Design and Construction Workflow Automation in Nepal",
      shortTitle: "Shared AEC Data Methodology Demonstrator",
      student: "Fabin Gurung",
      program: "MSc Structural Engineering",
      university: "Pokhara University",
      purpose:
        "A focused methodology and verified-results demonstrator—not a complete BIM, GIS, structural-design, BOQ or CPM product."
    },

    projects: [
      {
        id: "PROJECT_SAMPLE_MDM_001",
        code: "SAMPLE_MDM_001",
        name: "Sample Moment Distribution Project",
        studyContext: "Pokhara, Nepal",
        status: "verified",
        sourceId: "SRC_THESIS",
        gisStatus:
          "Framework level only; no verified site coordinate or production PostGIS layer is included."
      }
    ],

    levels: [
      {
        id: "LEVEL_ANALYTICAL_DATUM",
        projectId: "PROJECT_SAMPLE_MDM_001",
        name: "Analytical datum",
        elevation: datum(0, "m", "derived_verified", "SRC_SHARED_DIMENSIONS"),
        status: "derived_verified"
      },
      {
        id: "LEVEL_DEMO_1",
        projectId: "PROJECT_SAMPLE_MDM_001",
        name: "Illustrative Level 1",
        elevation: datum(
          3,
          "m",
          "illustrative",
          "DEMO_VIEWER",
          "Configurable viewer elevation; not a verified thesis result."
        ),
        status: "illustrative"
      }
    ],

    grids: [
      {
        id: "GRID_VIEWER_1",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "1",
        axis: "Y",
        ordinate: datum(
          0,
          "m",
          "illustrative",
          "DEMO_VIEWER",
          "Grid name is a viewer convention; the y=0 geometry is verified."
        ),
        status: "illustrative"
      },
      {
        id: "GRID_VIEWER_2",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "2",
        axis: "Y",
        ordinate: datum(4, "m", "illustrative", "DEMO_VIEWER"),
        status: "illustrative"
      }
    ],

    points: [
      {
        id: "POINT_A",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "A",
        x: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        y: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        z: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS")
      },
      {
        id: "POINT_B",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "B",
        x: datum(6, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        y: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        z: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS")
      },
      {
        id: "POINT_C",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "C",
        x: datum(12, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        y: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        z: datum(0, "m", "verified", "SRC_SHARED_DIMENSIONS")
      }
    ],

    sections: [
      {
        id: "SECTION_BEAM_230_450",
        name: "Rectangular 230 × 450 mm",
        shape: "rectangular",
        breadth: datum(0.23, "m", "verified", "SRC_SHARED_DIMENSIONS"),
        depth: datum(0.45, "m", "verified", "SRC_SHARED_DIMENSIONS")
      }
    ],

    elements: [
      {
        id: "BEAM_AB",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "AB",
        type: "beam",
        startPointId: "POINT_A",
        endPointId: "POINT_B",
        sectionId: "SECTION_BEAM_230_450",
        status: "verified",
        sourceId: "SRC_SHARED_DIMENSIONS"
      },
      {
        id: "BEAM_BC",
        projectId: "PROJECT_SAMPLE_MDM_001",
        label: "BC",
        type: "beam",
        startPointId: "POINT_B",
        endPointId: "POINT_C",
        sectionId: "SECTION_BEAM_230_450",
        status: "verified",
        sourceId: "SRC_SHARED_DIMENSIONS"
      }
    ],

    elementProperties: [
      {
        id: "PROPERTY_EI_AB",
        elementId: "BEAM_AB",
        name: "Flexural rigidity",
        code: "EI",
        value: datum(25000, "kN·m²", "verified", "SRC_SHARED_DIMENSIONS")
      },
      {
        id: "PROPERTY_EI_BC",
        elementId: "BEAM_BC",
        name: "Flexural rigidity",
        code: "EI",
        value: datum(25000, "kN·m²", "verified", "SRC_SHARED_DIMENSIONS")
      }
    ],

    loads: [
      {
        id: "LOAD_AB_UDL",
        elementId: "BEAM_AB",
        type: "uniformly_distributed",
        label: "Full-span UDL",
        magnitude: datum(10, "kN/m", "verified", "SRC_MDM_MEMBER")
      },
      {
        id: "LOAD_BC_ZERO",
        elementId: "BEAM_BC",
        type: "uniformly_distributed",
        label: "No distributed load",
        magnitude: datum(0, "kN/m", "verified", "SRC_MDM_MEMBER")
      }
    ],

    solveCases: [
      {
        id: "SOLVE_MDM_001",
        projectId: "PROJECT_SAMPLE_MDM_001",
        name: "Sample MDM Solve Case",
        method: "Moment Distribution Method",
        memberIds: ["BEAM_AB", "BEAM_BC"],
        endConditions: {
          BEAM_AB: { near: "fixed", far: "continuous" },
          BEAM_BC: { near: "continuous", far: "fixed" }
        },
        sourceStepOrders: [1, 2, 3, 4, 5, 7],
        status: "verified",
        sourceId: "SRC_MDM_TRACE"
      }
    ],

    verificationBaseline: {
      members: {
        BEAM_AB: {
          length: 6,
          ei: 25000,
          udl: 10,
          nearFinalMoment: -37.5,
          farFinalMoment: 15,
          nearReaction: 38.75,
          farReaction: 21.25,
          concreteVolume: 0.621
        },
        BEAM_BC: {
          length: 6,
          ei: 25000,
          udl: 0,
          nearFinalMoment: -15,
          farFinalMoment: -7.5,
          nearReaction: 1.25,
          farReaction: -1.25,
          concreteVolume: 0.621
        }
      },
      jointBImbalance: 0,
      duplicateStiffnessLocations: 0,
      isConverged: true,
      isSolveHealthy: true,
      concreteTotal: 1.242,
      diagramPointCount: 52,
      methodStepCountPerBeam: 6,
      specificationClauseCountPerBeam: 5,
      workLinkCountPerBeam: 5,
      workLinkCountTotal: 10,
      sourceIds: [
        "SRC_MDM_MEMBER",
        "SRC_MDM_HEALTH",
        "SRC_QUANTITY",
        "SRC_WORK_LINKS"
      ]
    },

    quantities: [
      {
        id: "QTY_CONCRETE_AB",
        elementId: "BEAM_AB",
        workItemId: "WORK_CONCRETE",
        type: "concrete_volume",
        formula: "L × b × D",
        unit: "m³",
        status: "verified",
        sourceId: "SRC_QUANTITY"
      },
      {
        id: "QTY_CONCRETE_BC",
        elementId: "BEAM_BC",
        workItemId: "WORK_CONCRETE",
        type: "concrete_volume",
        formula: "L × b × D",
        unit: "m³",
        status: "verified",
        sourceId: "SRC_QUANTITY"
      }
    ],

    workItems: [
      {
        id: "WORK_CONCRETE",
        code: "beam_rcc_concrete",
        name: "RCC concrete in beam",
        unit: "m³",
        dataState: "calculated"
      },
      {
        id: "WORK_REINFORCEMENT",
        code: "beam_reinforcement",
        name: "Reinforcement in beam",
        unit: "kg",
        dataState: "linked_only"
      },
      {
        id: "WORK_FORMWORK",
        code: "beam_formwork",
        name: "Formwork to beam",
        unit: "m²",
        dataState: "linked_only"
      },
      {
        id: "DOC_METHOD",
        code: "beam_method_statement",
        name: "Method statement for beam work",
        unit: "ls",
        dataState: "linked"
      },
      {
        id: "DOC_SPECIFICATION",
        code: "beam_specification",
        name: "Specification for beam work",
        unit: "ls",
        dataState: "linked"
      }
    ],

    elementWorkLinks: [
      { id: "LINK_AB_CONCRETE", elementId: "BEAM_AB", workItemId: "WORK_CONCRETE" },
      { id: "LINK_AB_REBAR", elementId: "BEAM_AB", workItemId: "WORK_REINFORCEMENT" },
      { id: "LINK_AB_FORMWORK", elementId: "BEAM_AB", workItemId: "WORK_FORMWORK" },
      { id: "LINK_AB_METHOD", elementId: "BEAM_AB", workItemId: "DOC_METHOD" },
      { id: "LINK_AB_SPEC", elementId: "BEAM_AB", workItemId: "DOC_SPECIFICATION" },
      { id: "LINK_BC_CONCRETE", elementId: "BEAM_BC", workItemId: "WORK_CONCRETE" },
      { id: "LINK_BC_REBAR", elementId: "BEAM_BC", workItemId: "WORK_REINFORCEMENT" },
      { id: "LINK_BC_FORMWORK", elementId: "BEAM_BC", workItemId: "WORK_FORMWORK" },
      { id: "LINK_BC_METHOD", elementId: "BEAM_BC", workItemId: "DOC_METHOD" },
      { id: "LINK_BC_SPEC", elementId: "BEAM_BC", workItemId: "DOC_SPECIFICATION" }
    ],

    methodTemplates: [
      {
        id: "METHOD_RCC_BEAM",
        code: "ms_rcc_beam_work",
        title: "Method Statement for RCC Beam Work",
        purpose: "To define the sequence and control requirements for RCC beam construction.",
        scope:
          "Applicable to RCC beam formwork, reinforcement placement, concreting, compaction, and curing.",
        safetyNotes:
          "Use PPE, provide safe access, ensure stable formwork, and restrict unauthorized access during concreting.",
        qualityNotes:
          "Check line, level, dimensions, reinforcement, cover, concrete quality, compaction, and curing.",
        linkedWorkItemId: "DOC_METHOD",
        status: "verified",
        sourceId: "SRC_METHOD",
        steps: [
          {
            order: 1,
            title: "Check drawings and dimensions",
            description:
              "Verify beam location, span, breadth, depth, levels, and supporting points using approved drawings and shared project element data.",
            inspection: "Confirm beam dimensions and coordinates before work starts.",
            responsible: "Site engineer"
          },
          {
            order: 2,
            title: "Prepare and fix formwork",
            description:
              "Install beam bottom and side formwork, ensuring proper line, level, support, tight joints, and required dimensions.",
            inspection: "Check formwork line, level, dimensions, and stability.",
            responsible: "Site supervisor"
          },
          {
            order: 3,
            title: "Place reinforcement",
            description:
              "Place bottom bars, top bars, stirrups, extra bars, laps, hooks, and spacers as per structural drawing.",
            inspection: "Check bar size, spacing, lap length, cover, and anchorage.",
            responsible: "Site engineer"
          },
          {
            order: 4,
            title: "Pre-concreting inspection",
            description:
              "Inspect reinforcement, formwork, cover blocks, embedded items, cleanliness, and access before concrete placement.",
            inspection: "Approve pour card or inspection checklist before concreting.",
            responsible: "Engineer / QA"
          },
          {
            order: 5,
            title: "Concrete placement and compaction",
            description:
              "Place concrete continuously in the beam and compact using suitable vibration without displacing reinforcement or formwork.",
            inspection: "Check concrete workability, placement, and compaction.",
            responsible: "Site supervisor"
          },
          {
            order: 6,
            title: "Curing and protection",
            description:
              "Protect the beam from disturbance and begin curing after initial setting as per project specification.",
            inspection: "Confirm curing method and duration.",
            responsible: "Site supervisor"
          }
        ]
      }
    ],

    specificationTemplates: [
      {
        id: "SPEC_RCC_BEAM",
        code: "spec_rcc_beam_work",
        title: "Specification for RCC Beam Work",
        generalRequirement:
          "RCC beam work shall be executed according to approved drawings, project specifications, and accepted engineering practice.",
        linkedWorkItemId: "DOC_SPECIFICATION",
        status: "verified",
        sourceId: "SRC_SPECIFICATION",
        clauses: [
          {
            order: 1,
            title: "Materials",
            text:
              "Concrete, reinforcement, binding wire, cover blocks, and formwork materials shall conform to approved project requirements.",
            acceptance: "Materials shall be approved before use."
          },
          {
            order: 2,
            title: "Formwork",
            text:
              "Formwork shall be rigid, properly supported, leak-proof, and set to correct line, level, and dimensions.",
            acceptance: "No excessive deflection, leakage, or dimensional deviation."
          },
          {
            order: 3,
            title: "Reinforcement",
            text:
              "Reinforcement shall be placed as per approved structural drawings with required cover, spacing, laps, hooks, and anchorage.",
            acceptance:
              "Bar diameter, spacing, cover, and placement shall match approved drawings."
          },
          {
            order: 4,
            title: "Concrete placement",
            text:
              "Concrete shall be placed without segregation and compacted properly using appropriate vibration.",
            acceptance: "Concrete shall be compact, uniform, and free from honeycombing."
          },
          {
            order: 5,
            title: "Curing",
            text:
              "Concrete shall be cured after initial setting and protected from premature drying, impact, or disturbance.",
            acceptance: "Curing shall be maintained for the required project duration."
          }
        ]
      }
    ],

    illustrativeActivities: [
      {
        id: "ACT_VERIFY",
        name: "Verify shared dimensions",
        predecessorId: null,
        relationship: "start",
        sourceId: "DEMO_SCHEDULE"
      },
      {
        id: "ACT_FORMWORK",
        name: "Beam formwork",
        predecessorId: "ACT_VERIFY",
        relationship: "finish-to-start",
        sourceId: "DEMO_SCHEDULE"
      },
      {
        id: "ACT_REBAR",
        name: "Reinforcement placement",
        predecessorId: "ACT_FORMWORK",
        relationship: "finish-to-start",
        sourceId: "DEMO_SCHEDULE"
      },
      {
        id: "ACT_INSPECTION",
        name: "Pre-concreting inspection",
        predecessorId: "ACT_REBAR",
        relationship: "finish-to-start",
        sourceId: "DEMO_SCHEDULE"
      },
      {
        id: "ACT_CONCRETE",
        name: "Concrete placement and curing",
        predecessorId: "ACT_INSPECTION",
        relationship: "finish-to-start",
        sourceId: "DEMO_SCHEDULE"
      }
    ],

    viewConsumers: [
      {
        id: "VIEW_GRAPH",
        name: "Methodology graph",
        domain: "shared",
        consumes: ["element.id", "element.relationships", "element.status"]
      },
      {
        id: "VIEW_ARCH_PLAN",
        name: "Architecture plan",
        domain: "architecture",
        consumes: [
          "element.startPointId",
          "element.endPointId",
          "point.coordinates",
          "section.breadth",
          "section.depth"
        ]
      },
      {
        id: "VIEW_STRUCTURAL_MODEL",
        name: "Structural geometry viewer",
        domain: "engineering",
        consumes: [
          "element.startPointId",
          "element.endPointId",
          "point.coordinates",
          "viewer.level"
        ]
      },
      {
        id: "VIEW_ENGINEERING",
        name: "MDM + BMD/SFD/AFD",
        domain: "engineering",
        consumes: [
          "element.length",
          "property.EI",
          "load.magnitude",
          "solve.endConditions"
        ]
      },
      {
        id: "VIEW_CONSTRUCTION",
        name: "Quantity + work delivery",
        domain: "construction",
        consumes: [
          "element.length",
          "section.breadth",
          "section.depth",
          "elementWorkLinks"
        ]
      }
    ],

    graphNodes: [
      {
        id: "PROJECT_SAMPLE_MDM_001",
        label: "Sample Project",
        sublabel: "SAMPLE_MDM_001",
        category: "core",
        description: "Controlled two-span validation project.",
        globalLayer: 0
      },
      {
        id: "HUB_SHARED_ELEMENT",
        label: "Shared Element Hub",
        sublabel: "Store once · reuse",
        category: "hub",
        description:
          "Normalized identity, geometry, property and relationship records shared by every view.",
        globalLayer: 1
      },
      {
        id: "DOMAIN_ARCHITECTURE",
        label: "A — Architecture",
        sublabel: "Plan + schedule",
        category: "architecture",
        description: "Consumes shared points, connectivity and section metadata.",
        globalLayer: 3,
        target: "architecture"
      },
      {
        id: "DOMAIN_ENGINEERING",
        label: "E — Engineering",
        sublabel: "Model + MDM",
        category: "engineering",
        description: "Consumes shared geometry, EI, loads and end conditions.",
        globalLayer: 3,
        target: "engineering"
      },
      {
        id: "DOMAIN_CONSTRUCTION",
        label: "C — Construction",
        sublabel: "Quantity + delivery",
        category: "construction",
        description: "Consumes shared dimensions and element–work links.",
        globalLayer: 3,
        target: "construction"
      },
      {
        id: "VIEW_ARCH_PLAN",
        label: "Plan Output",
        sublabel: "A—B—C",
        category: "architecture",
        description: "Programmatic line and nodal representation.",
        globalLayer: 4,
        target: "architecture"
      },
      {
        id: "VIEW_ENGINEERING",
        label: "Structural Output",
        sublabel: "MDM · BMD · SFD · AFD",
        category: "engineering",
        description: "Deterministic trace, diagrams and equilibrium checks.",
        globalLayer: 4,
        target: "engineering"
      },
      {
        id: "VIEW_CONSTRUCTION",
        label: "Delivery Output",
        sublabel: "Quantity · work links",
        category: "construction",
        description: "Concrete volume, work items, method and specification.",
        globalLayer: 4,
        target: "construction"
      },
      {
        id: "POINT_A",
        label: "Point A",
        sublabel: "Verified coordinate",
        category: "geometry",
        description: "Verified start point of Beam AB."
      },
      {
        id: "POINT_B",
        label: "Point B",
        sublabel: "Verified coordinate",
        category: "geometry",
        description: "Verified shared joint between Beam AB and Beam BC."
      },
      {
        id: "POINT_C",
        label: "Point C",
        sublabel: "Verified coordinate",
        category: "geometry",
        description: "Verified end point of Beam BC."
      },
      {
        id: "BEAM_AB",
        label: "Beam AB",
        sublabel: "Verified element",
        category: "element",
        elementId: "BEAM_AB",
        description: "Canonical beam entity from Point A to Point B.",
        globalLayer: 2
      },
      {
        id: "BEAM_BC",
        label: "Beam BC",
        sublabel: "Verified element",
        category: "element",
        elementId: "BEAM_BC",
        description: "Canonical beam entity from Point B to Point C.",
        globalLayer: 2
      },
      {
        id: "SECTION_BEAM_230_450",
        label: "Beam Section",
        sublabel: "b × D",
        category: "property",
        description: "Shared verified rectangular section metadata."
      },
      {
        id: "PROPERTY_EI_AB",
        label: "EI · AB",
        sublabel: "Structural property",
        category: "property",
        elementId: "BEAM_AB",
        description: "Verified flexural rigidity for Beam AB."
      },
      {
        id: "PROPERTY_EI_BC",
        label: "EI · BC",
        sublabel: "Structural property",
        category: "property",
        elementId: "BEAM_BC",
        description: "Verified flexural rigidity for Beam BC."
      },
      {
        id: "LOAD_AB_UDL",
        label: "UDL · AB",
        sublabel: "Full-span load",
        category: "load",
        elementId: "BEAM_AB",
        description: "Verified uniformly distributed load on Beam AB."
      },
      {
        id: "LOAD_BC_ZERO",
        label: "Load · BC",
        sublabel: "Zero UDL",
        category: "load",
        elementId: "BEAM_BC",
        description: "Verified absence of distributed load on Beam BC."
      },
      {
        id: "SOLVE_MDM_001",
        label: "MDM Solve Case",
        sublabel: "Verified trace sequence",
        category: "analysis",
        description: "Verified deterministic Moment Distribution Method workflow."
      },
      {
        id: "RESULT_AB",
        label: "Result · AB",
        sublabel: "Moments + reactions",
        category: "analysis",
        elementId: "BEAM_AB",
        description: "Verified source result for Beam AB."
      },
      {
        id: "RESULT_BC",
        label: "Result · BC",
        sublabel: "Moments + reactions",
        category: "analysis",
        elementId: "BEAM_BC",
        description: "Verified source result for Beam BC."
      },
      {
        id: "QTY_CONCRETE_AB",
        label: "Concrete · AB",
        sublabel: "L × b × D",
        category: "quantity",
        elementId: "BEAM_AB",
        description: "Verified concrete volume for Beam AB."
      },
      {
        id: "QTY_CONCRETE_BC",
        label: "Concrete · BC",
        sublabel: "L × b × D",
        category: "quantity",
        elementId: "BEAM_BC",
        description: "Verified concrete volume for Beam BC."
      },
      {
        id: "WORK_CONCRETE",
        label: "Concrete Work",
        sublabel: "Calculated quantity",
        category: "work",
        description: "RCC concrete work item linked to both beams."
      },
      {
        id: "WORK_REINFORCEMENT",
        label: "Reinforcement",
        sublabel: "Linked · no quantity",
        category: "work",
        description: "Verified relationship; quantity unavailable."
      },
      {
        id: "WORK_FORMWORK",
        label: "Formwork",
        sublabel: "Linked · no area",
        category: "work",
        description: "Verified relationship; area unavailable."
      },
      {
        id: "DOC_METHOD",
        label: "Method Statement",
        sublabel: "6 source steps",
        category: "document",
        description: "Source-backed RCC beam method statement."
      },
      {
        id: "DOC_SPECIFICATION",
        label: "Specification",
        sublabel: "5 source clauses",
        category: "document",
        description: "Source-backed RCC beam specification."
      }
    ],

    relationships: [
      {
        id: "REL_PROJECT_HUB",
        source: "PROJECT_SAMPLE_MDM_001",
        target: "HUB_SHARED_ELEMENT",
        type: "contains",
        global: true
      },
      {
        id: "REL_HUB_ARCH",
        source: "HUB_SHARED_ELEMENT",
        target: "DOMAIN_ARCHITECTURE",
        type: "feeds",
        global: true
      },
      {
        id: "REL_HUB_ENG",
        source: "HUB_SHARED_ELEMENT",
        target: "DOMAIN_ENGINEERING",
        type: "feeds",
        global: true
      },
      {
        id: "REL_HUB_CON",
        source: "HUB_SHARED_ELEMENT",
        target: "DOMAIN_CONSTRUCTION",
        type: "feeds",
        global: true
      },
      {
        id: "REL_ARCH_OUTPUT",
        source: "DOMAIN_ARCHITECTURE",
        target: "VIEW_ARCH_PLAN",
        type: "produces",
        global: true
      },
      {
        id: "REL_ENG_OUTPUT",
        source: "DOMAIN_ENGINEERING",
        target: "VIEW_ENGINEERING",
        type: "produces",
        global: true
      },
      {
        id: "REL_CON_OUTPUT",
        source: "DOMAIN_CONSTRUCTION",
        target: "VIEW_CONSTRUCTION",
        type: "produces",
        global: true
      },
      { id: "REL_PROJECT_A", source: "PROJECT_SAMPLE_MDM_001", target: "POINT_A", type: "contains" },
      { id: "REL_PROJECT_B", source: "PROJECT_SAMPLE_MDM_001", target: "POINT_B", type: "contains" },
      { id: "REL_PROJECT_C", source: "PROJECT_SAMPLE_MDM_001", target: "POINT_C", type: "contains" },
      { id: "REL_PROJECT_AB", source: "PROJECT_SAMPLE_MDM_001", target: "BEAM_AB", type: "contains" },
      { id: "REL_PROJECT_BC", source: "PROJECT_SAMPLE_MDM_001", target: "BEAM_BC", type: "contains" },
      {
        id: "REL_HUB_AB",
        source: "HUB_SHARED_ELEMENT",
        target: "BEAM_AB",
        type: "references",
        global: true
      },
      {
        id: "REL_HUB_BC",
        source: "HUB_SHARED_ELEMENT",
        target: "BEAM_BC",
        type: "references",
        global: true
      },
      { id: "REL_AB_START", source: "BEAM_AB", target: "POINT_A", type: "starts_at" },
      { id: "REL_AB_END", source: "BEAM_AB", target: "POINT_B", type: "ends_at" },
      { id: "REL_BC_START", source: "BEAM_BC", target: "POINT_B", type: "starts_at" },
      { id: "REL_BC_END", source: "BEAM_BC", target: "POINT_C", type: "ends_at" },
      {
        id: "REL_AB_SECTION",
        source: "BEAM_AB",
        target: "SECTION_BEAM_230_450",
        type: "has_section"
      },
      {
        id: "REL_BC_SECTION",
        source: "BEAM_BC",
        target: "SECTION_BEAM_230_450",
        type: "has_section"
      },
      { id: "REL_AB_EI", source: "BEAM_AB", target: "PROPERTY_EI_AB", type: "has_property" },
      { id: "REL_BC_EI", source: "BEAM_BC", target: "PROPERTY_EI_BC", type: "has_property" },
      { id: "REL_AB_LOAD", source: "BEAM_AB", target: "LOAD_AB_UDL", type: "loaded_by" },
      { id: "REL_BC_LOAD", source: "BEAM_BC", target: "LOAD_BC_ZERO", type: "loaded_by" },
      {
        id: "REL_SOLVE_AB",
        source: "SOLVE_MDM_001",
        target: "BEAM_AB",
        type: "analyzes"
      },
      {
        id: "REL_SOLVE_BC",
        source: "SOLVE_MDM_001",
        target: "BEAM_BC",
        type: "analyzes"
      },
      { id: "REL_SOLVE_RESULT_AB", source: "SOLVE_MDM_001", target: "RESULT_AB", type: "produces" },
      { id: "REL_SOLVE_RESULT_BC", source: "SOLVE_MDM_001", target: "RESULT_BC", type: "produces" },
      { id: "REL_AB_RESULT", source: "BEAM_AB", target: "RESULT_AB", type: "has_result" },
      { id: "REL_BC_RESULT", source: "BEAM_BC", target: "RESULT_BC", type: "has_result" },
      {
        id: "REL_AB_QTY",
        source: "BEAM_AB",
        target: "QTY_CONCRETE_AB",
        type: "quantified_as"
      },
      {
        id: "REL_BC_QTY",
        source: "BEAM_BC",
        target: "QTY_CONCRETE_BC",
        type: "quantified_as"
      },
      {
        id: "REL_QTY_AB_WORK",
        source: "QTY_CONCRETE_AB",
        target: "WORK_CONCRETE",
        type: "maps_to"
      },
      {
        id: "REL_QTY_BC_WORK",
        source: "QTY_CONCRETE_BC",
        target: "WORK_CONCRETE",
        type: "maps_to"
      },
      { id: "REL_AB_WORK_CON", source: "BEAM_AB", target: "WORK_CONCRETE", type: "mapped_to" },
      { id: "REL_AB_WORK_REB", source: "BEAM_AB", target: "WORK_REINFORCEMENT", type: "mapped_to" },
      { id: "REL_AB_WORK_FOR", source: "BEAM_AB", target: "WORK_FORMWORK", type: "mapped_to" },
      { id: "REL_AB_DOC_M", source: "BEAM_AB", target: "DOC_METHOD", type: "documented_by" },
      { id: "REL_AB_DOC_S", source: "BEAM_AB", target: "DOC_SPECIFICATION", type: "specified_by" },
      { id: "REL_BC_WORK_CON", source: "BEAM_BC", target: "WORK_CONCRETE", type: "mapped_to" },
      { id: "REL_BC_WORK_REB", source: "BEAM_BC", target: "WORK_REINFORCEMENT", type: "mapped_to" },
      { id: "REL_BC_WORK_FOR", source: "BEAM_BC", target: "WORK_FORMWORK", type: "mapped_to" },
      { id: "REL_BC_DOC_M", source: "BEAM_BC", target: "DOC_METHOD", type: "documented_by" },
      { id: "REL_BC_DOC_S", source: "BEAM_BC", target: "DOC_SPECIFICATION", type: "specified_by" },
      {
        id: "REL_AB_ARCH",
        source: "BEAM_AB",
        target: "DOMAIN_ARCHITECTURE",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_AB_ENG",
        source: "BEAM_AB",
        target: "DOMAIN_ENGINEERING",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_AB_CON",
        source: "BEAM_AB",
        target: "DOMAIN_CONSTRUCTION",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_BC_ARCH",
        source: "BEAM_BC",
        target: "DOMAIN_ARCHITECTURE",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_BC_ENG",
        source: "BEAM_BC",
        target: "DOMAIN_ENGINEERING",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_BC_CON",
        source: "BEAM_BC",
        target: "DOMAIN_CONSTRUCTION",
        type: "represented_in",
        global: true
      },
      {
        id: "REL_ARCH_PLAN",
        source: "BEAM_AB",
        target: "VIEW_ARCH_PLAN",
        type: "represented_in"
      },
      {
        id: "REL_ENG_VIEW",
        source: "BEAM_AB",
        target: "VIEW_ENGINEERING",
        type: "represented_in"
      },
      {
        id: "REL_CON_VIEW",
        source: "BEAM_AB",
        target: "VIEW_CONSTRUCTION",
        type: "represented_in"
      }
    ]
  };

  window.AEC_MODEL = deepFreeze(model);
})();
