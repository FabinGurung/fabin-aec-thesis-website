(function () {
  "use strict";

  const model = window.AEC_MODEL;
  const byId = (items, id) => items.find((item) => item.id === id);
  const value = (datum) => (datum && typeof datum === "object" && "value" in datum ? datum.value : datum);
  const round = (number, decimals) => {
    const factor = 10 ** (decimals == null ? 6 : decimals);
    return Math.round((number + Number.EPSILON) * factor) / factor;
  };

  const basePointMap = () =>
    Object.fromEntries(
      model.points.map((point) => [
        point.id,
        { id: point.id, label: point.label, x: value(point.x), y: value(point.y), z: value(point.z) }
      ])
    );

  const distance = (a, b) =>
    Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);

  function buildGeometry(state) {
    const points = basePointMap();
    const sandbox = state && state.sandbox;
    if (sandbox && sandbox.enabled) {
      const lengthAB = Number(sandbox.lengthAB);
      const baseBC = distance(points.POINT_B, points.POINT_C);
      points.POINT_B.x = points.POINT_A.x + lengthAB;
      points.POINT_C.x = points.POINT_B.x + baseBC;
    }
    return points;
  }

  function solveMDM(lengthAB) {
    const elementAB = byId(model.elements, "BEAM_AB");
    const elementBC = byId(model.elements, "BEAM_BC");
    const eiAB = value(byId(model.elementProperties, "PROPERTY_EI_AB").value);
    const eiBC = value(byId(model.elementProperties, "PROPERTY_EI_BC").value);
    const wAB = value(byId(model.loads, "LOAD_AB_UDL").magnitude);
    const wBC = value(byId(model.loads, "LOAD_BC_ZERO").magnitude);
    const geometry = buildGeometry({
      sandbox: { enabled: true, lengthAB }
    });
    const lAB = distance(geometry[elementAB.startPointId], geometry[elementAB.endPointId]);
    const lBC = distance(geometry[elementBC.startPointId], geometry[elementBC.endPointId]);

    const kAB = (4 * eiAB) / lAB;
    const kBC = (4 * eiBC) / lBC;
    const totalK = kAB + kBC;
    const dfAB = kAB / totalK;
    const dfBC = kBC / totalK;

    const femABNear = -(wAB * lAB ** 2) / 12;
    const femABFar = (wAB * lAB ** 2) / 12;
    const femBCNear = -(wBC * lBC ** 2) / 12;
    const femBCFar = (wBC * lBC ** 2) / 12;
    const unbalancedB = femABFar + femBCNear;
    const balance = -unbalancedB;
    const distributionAB = balance * dfAB;
    const distributionBC = balance * dfBC;
    const carryToA = distributionAB / 2;
    const carryToC = distributionBC / 2;

    const moments = {
      BEAM_AB: {
        near: femABNear + carryToA,
        far: femABFar + distributionAB
      },
      BEAM_BC: {
        near: femBCNear + distributionBC,
        far: femBCFar + carryToC
      }
    };

    const memberInputs = {
      BEAM_AB: { length: lAB, ei: eiAB, udl: wAB },
      BEAM_BC: { length: lBC, ei: eiBC, udl: wBC }
    };

    const results = {};
    Object.keys(memberInputs).forEach((elementId) => {
      const input = memberInputs[elementId];
      const end = moments[elementId];
      const nearReaction =
        (input.udl * input.length) / 2 + (end.far - end.near) / input.length;
      const farReaction = input.udl * input.length - nearReaction;
      const criticalX =
        input.udl === 0
          ? null
          : Math.max(0, Math.min(input.length, nearReaction / input.udl));
      const momentAt = (x) =>
        end.near + nearReaction * x - (input.udl * x ** 2) / 2;
      results[elementId] = {
        ...input,
        stiffness: elementId === "BEAM_AB" ? kAB : kBC,
        distributionFactor: elementId === "BEAM_AB" ? dfAB : dfBC,
        femNear: elementId === "BEAM_AB" ? femABNear : femBCNear,
        femFar: elementId === "BEAM_AB" ? femABFar : femBCFar,
        distributedAtB: elementId === "BEAM_AB" ? distributionAB : distributionBC,
        carryOver:
          elementId === "BEAM_AB" ? carryToA : carryToC,
        nearMoment: end.near,
        farMoment: end.far,
        nearReaction,
        farReaction,
        criticalX,
        criticalMoment: criticalX == null ? null : momentAt(criticalX),
        momentAt,
        shearAt: (x) => nearReaction - input.udl * x,
        axialAt: () => 0
      };
    });

    return {
      memberInputs,
      results,
      joint: {
        totalStiffness: totalK,
        initialUnbalancedMoment: unbalancedB,
        balanceMoment: balance,
        finalImbalance:
          results.BEAM_AB.farMoment + results.BEAM_BC.nearMoment
      },
      trace: [
        {
          order: 1,
          code: "FEM",
          title: "Fixed end moment",
          summary: `AB = ${formatSigned(femABNear, 3)} / ${formatSigned(
            femABFar,
            3
          )} kN·m; BC = ${formatSigned(femBCNear, 3)} / ${formatSigned(
            femBCFar,
            3
          )} kN·m`,
          formula: "UDL member: Mᶠ = ±wL²/12"
        },
        {
          order: 2,
          code: "STIFFNESS",
          title: "Member stiffness",
          summary: `Kᴮᴬ = ${format(kAB, 3)}; Kᴮᶜ = ${format(kBC, 3)} kN·m/rad`,
          formula: "Far end fixed: K = 4EI/L"
        },
        {
          order: 3,
          code: "DISTRIBUTION_FACTOR",
          title: "Distribution factor",
          summary: `DFᴮᴬ = ${format(dfAB, 3)}; DFᴮᶜ = ${format(dfBC, 3)}`,
          formula: "DF = Kmember / ΣKjoint"
        },
        {
          order: 4,
          code: "DISTRIBUTED_MOMENT",
          title: "Distributed moment",
          summary: `BA = ${formatSigned(distributionAB, 3)}; BC = ${formatSigned(
            distributionBC,
            3
          )} kN·m`,
          formula: `Balance at B = ${formatSigned(balance, 3)} kN·m`
        },
        {
          order: 5,
          code: "CARRY_OVER_RECEIVED",
          title: "Carry-over received",
          summary: `A = ${formatSigned(carryToA, 3)}; C = ${formatSigned(
            carryToC,
            3
          )} kN·m`,
          formula: "Carry-over factor = 1/2"
        },
        {
          order: 7,
          code: "FINAL_END_MOMENT",
          title: "Final end moment",
          summary: `AB = ${formatSigned(results.BEAM_AB.nearMoment, 3)} / ${formatSigned(
            results.BEAM_AB.farMoment,
            3
          )}; BC = ${formatSigned(results.BEAM_BC.nearMoment, 3)} / ${formatSigned(
            results.BEAM_BC.farMoment,
            3
          )} kN·m`,
          formula: "Final = FEM + distribution + received carry-over"
        }
      ]
    };
  }

  function runtime(state) {
    const points = buildGeometry(state || {});
    const elements = model.elements.map((element) => {
      const start = points[element.startPointId];
      const end = points[element.endPointId];
      return {
        ...element,
        start,
        end,
        length: distance(start, end),
        section: byId(model.sections, element.sectionId),
        property: model.elementProperties.find((item) => item.elementId === element.id),
        load: model.loads.find((item) => item.elementId === element.id)
      };
    });
    const lengthAB = elements.find((item) => item.id === "BEAM_AB").length;
    const analysis = solveMDM(lengthAB);
    const quantities = elements.map((element) => {
      const breadth = value(element.section.breadth);
      const depth = value(element.section.depth);
      return {
        id: `QTY_CONCRETE_${element.label}`,
        elementId: element.id,
        formula: "L × b × D",
        inputs: { length: element.length, breadth, depth },
        value: element.length * breadth * depth,
        unit: "m³",
        status:
          state && state.sandbox && state.sandbox.enabled
            ? "illustrative"
            : "verified"
      };
    });
    return {
      isSandbox: Boolean(state && state.sandbox && state.sandbox.enabled),
      points,
      elements,
      analysis,
      quantities,
      concreteTotal: quantities.reduce((sum, item) => sum + item.value, 0),
      levelHeight:
        state && state.viewer && Number.isFinite(Number(state.viewer.levelHeight))
          ? Number(state.viewer.levelHeight)
          : value(byId(model.levels, "LEVEL_DEMO_1").elevation)
    };
  }

  function elementForEntity(entityId) {
    if (model.elements.some((item) => item.id === entityId)) return entityId;
    const collections = [
      model.elementProperties,
      model.loads,
      model.quantities,
      model.graphNodes
    ];
    for (const collection of collections) {
      const item = collection.find((entry) => entry.id === entityId);
      if (item && item.elementId) return item.elementId;
    }
    const link = model.elementWorkLinks.find((item) => item.id === entityId);
    return link ? link.elementId : null;
  }

  function nodeLabel(id) {
    const node = byId(model.graphNodes, id);
    return node ? node.label : id;
  }

  function format(number, decimals) {
    const places = decimals == null ? 2 : decimals;
    return Number(number).toLocaleString("en-US", {
      minimumFractionDigits: places,
      maximumFractionDigits: places
    });
  }

  function formatSigned(number, decimals) {
    const n = Number(number);
    return `${n > 0 ? "+" : ""}${format(n, decimals)}`;
  }

  window.AEC = {
    model,
    provenance: window.AEC_PROVENANCE,
    query: {
      byId,
      value,
      round,
      distance,
      runtime,
      solveMDM,
      elementForEntity,
      nodeLabel,
      format,
      formatSigned
    }
  };
})();
