(function () {
  "use strict";

  const model = window.AEC.model;
  const query = window.AEC.query;
  const tolerance = 1e-6;
  const close = (a, b, tol) => Math.abs(Number(a) - Number(b)) <= (tol || tolerance);

  function validate() {
    const checks = [];
    const record = (name, passed, detail) =>
      checks.push({ name, passed: Boolean(passed), detail: detail || "" });

    const canonicalCollections = [
      model.projects,
      model.levels,
      model.grids,
      model.points,
      model.sections,
      model.elements,
      model.elementProperties,
      model.loads,
      model.solveCases,
      model.quantities,
      model.workItems,
      model.elementWorkLinks,
      model.methodTemplates,
      model.specificationTemplates
    ];
    const canonicalIds = canonicalCollections.flat().map((item) => item.id);
    record(
      "Canonical IDs are unique",
      new Set(canonicalIds).size === canonicalIds.length
    );
    record(
      "Graph node IDs are unique",
      new Set(model.graphNodes.map((item) => item.id)).size ===
        model.graphNodes.length
    );
    record(
      "Relationship IDs are unique",
      new Set(model.relationships.map((item) => item.id)).size ===
        model.relationships.length
    );

    const pointIds = new Set(model.points.map((item) => item.id));
    const sectionIds = new Set(model.sections.map((item) => item.id));
    const elementIds = new Set(model.elements.map((item) => item.id));
    const workIds = new Set(model.workItems.map((item) => item.id));
    record(
      "Element point references resolve",
      model.elements.every(
        (item) => pointIds.has(item.startPointId) && pointIds.has(item.endPointId)
      )
    );
    record(
      "Element section references resolve",
      model.elements.every((item) => sectionIds.has(item.sectionId))
    );
    record(
      "Loads reference elements",
      model.loads.every((item) => elementIds.has(item.elementId))
    );
    record(
      "Properties reference elements",
      model.elementProperties.every((item) => elementIds.has(item.elementId))
    );
    record(
      "Quantities reference elements and work items",
      model.quantities.every(
        (item) => elementIds.has(item.elementId) && workIds.has(item.workItemId)
      )
    );
    record(
      "Work links resolve",
      model.elementWorkLinks.every(
        (item) => elementIds.has(item.elementId) && workIds.has(item.workItemId)
      )
    );

    const graphIds = new Set(model.graphNodes.map((item) => item.id));
    record(
      "Graph relationships resolve",
      model.relationships.every(
        (item) => graphIds.has(item.source) && graphIds.has(item.target)
      )
    );

    const state = {
      sandbox: { enabled: false, lengthAB: 6 },
      viewer: { levelHeight: 3 }
    };
    const runtime = query.runtime(state);
    const baseline = model.verificationBaseline;
    Object.entries(baseline.members).forEach(([elementId, expected]) => {
      const element = runtime.elements.find((item) => item.id === elementId);
      const result = runtime.analysis.results[elementId];
      const quantity = runtime.quantities.find((item) => item.elementId === elementId);
      record(`${elementId} length matches evidence`, close(element.length, expected.length));
      record(`${elementId} EI matches evidence`, close(result.ei, expected.ei));
      record(`${elementId} load matches evidence`, close(result.udl, expected.udl));
      record(
        `${elementId} final moments match evidence`,
        close(result.nearMoment, expected.nearFinalMoment) &&
          close(result.farMoment, expected.farFinalMoment)
      );
      record(
        `${elementId} reactions match evidence`,
        close(result.nearReaction, expected.nearReaction) &&
          close(result.farReaction, expected.farReaction)
      );
      record(
        `${elementId} concrete volume matches evidence`,
        close(quantity.value, expected.concreteVolume)
      );
    });

    record(
      "Joint B final equilibrium closes",
      close(runtime.analysis.joint.finalImbalance, baseline.jointBImbalance)
    );
    record(
      "Concrete total matches evidence",
      close(runtime.concreteTotal, baseline.concreteTotal)
    );
    record(
      "MDM source step sequence preserved",
      model.solveCases[0].sourceStepOrders.join(",") === "1,2,3,4,5,7"
    );
    record(
      "Ten unique element–work links preserved",
      model.elementWorkLinks.length === baseline.workLinkCountTotal &&
        new Set(model.elementWorkLinks.map((item) => item.id)).size ===
          baseline.workLinkCountTotal
    );
    record(
      "Five links exist for each beam",
      model.elements.every(
        (element) =>
          model.elementWorkLinks.filter((link) => link.elementId === element.id)
            .length === baseline.workLinkCountPerBeam
      )
    );
    record(
      "Method template contains six source steps",
      model.methodTemplates[0].steps.length === baseline.methodStepCountPerBeam
    );
    record(
      "Specification contains five source clauses",
      model.specificationTemplates[0].clauses.length ===
        baseline.specificationClauseCountPerBeam
    );

    return {
      passed: checks.every((item) => item.passed),
      passedCount: checks.filter((item) => item.passed).length,
      totalCount: checks.length,
      checks
    };
  }

  window.AEC.integrity = { validate };
})();
