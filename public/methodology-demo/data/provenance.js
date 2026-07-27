(function () {
  "use strict";

  window.AEC_PROVENANCE = Object.freeze({
    SRC_THESIS: {
      label: "Cleaned MSc thesis source",
      detail:
        "Fabin Gurung, MSc Structural Engineering, Pokhara University. Cleaned public-safe thesis package.",
      status: "verified"
    },
    SRC_SHARED_DIMENSIONS: {
      label: "Shared element dimensions export",
      detail:
        "Verified export of points, element connectivity, dimensions and flexural rigidity.",
      status: "verified"
    },
    SRC_MDM_MEMBER: {
      label: "MDM member summary export",
      detail:
        "Verified member lengths, end conditions, loads, final moments and reactions.",
      status: "verified"
    },
    SRC_MDM_TRACE: {
      label: "MDM calculation trace export",
      detail:
        "Verified source sequence uses Steps 1, 2, 3, 4, 5 and 7.",
      status: "verified"
    },
    SRC_MDM_HEALTH: {
      label: "MDM health-check export",
      detail:
        "Verified convergence, joint equilibrium and duplicate-stiffness checks.",
      status: "verified"
    },
    SRC_ARCHITECTURE: {
      label: "Architecture line-element export",
      detail:
        "Verified A–B–C point and AB/BC line-element representation.",
      status: "verified"
    },
    SRC_QUANTITY: {
      label: "Beam concrete quantity export",
      detail:
        "Verified L × b × D concrete volume for Beam AB and Beam BC.",
      status: "verified"
    },
    SRC_WORK_LINKS: {
      label: "Element–work-item links export",
      detail:
        "Ten verified links: five construction/document records for each beam.",
      status: "verified"
    },
    SRC_METHOD: {
      label: "Method-statement steps export",
      detail:
        "Six source-backed RCC beam work steps linked to both beam elements.",
      status: "verified"
    },
    SRC_SPECIFICATION: {
      label: "Specification clauses export",
      detail:
        "Five source-backed RCC beam specification clauses linked to both beam elements.",
      status: "verified"
    },
    DERIVED_STATICS: {
      label: "Deterministic structural derivation",
      detail:
        "Calculated from the verified load case using equilibrium and beam relationships.",
      status: "derived_verified"
    },
    DEMO_VIEWER: {
      label: "Illustrative structural-viewer extension",
      detail:
        "Grid 2, columns, slab, transverse framing and storey elevation are demonstrative only.",
      status: "illustrative"
    },
    DEMO_SCHEDULE: {
      label: "Illustrative downstream planning view",
      detail:
        "Relationship sequence only; no activity duration is presented as a thesis result.",
      status: "illustrative"
    }
  });
})();
