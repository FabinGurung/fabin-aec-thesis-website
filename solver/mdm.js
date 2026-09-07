function farEnd(end) {
  if (end.length !== 2) throw new Error(`member-end label must contain two node labels: ${end}`);
  return end[1] + end[0];
}

export function solveMomentDistribution({
  initialEndMoments,
  jointEnds,
  distributionFactors,
  jointOrder,
  cycles,
  carryoverFactor = 0.5,
  zeroCarryoverFrom = [],
  preAdjustments = [],
}) {
  if (!Number.isInteger(cycles) || cycles < 1) throw new Error("cycles must be >= 1");
  const moments = Object.fromEntries(Object.entries(initialEndMoments).map(([k, v]) => [k, Number(v)]));
  const zeros = new Set(zeroCarryoverFrom);
  const trace = [];

  for (const op of preAdjustments) {
    const end = String(op.end);
    const delta = Number(op.delta);
    moments[end] = (moments[end] ?? 0) + delta;
    const record = { operation: "pre_adjustment", end, delta };
    if (op.farEnd !== undefined || op.far_end !== undefined) {
      const far = String(op.farEnd ?? op.far_end);
      const farDelta = Number(op.farDelta ?? op.far_delta ?? 0);
      moments[far] = (moments[far] ?? 0) + farDelta;
      Object.assign(record, { farEnd: far, farDelta });
    }
    trace.push(record);
  }

  for (let cycle = 1; cycle <= cycles; cycle += 1) {
    for (const joint of jointOrder) {
      const ends = [...jointEnds[joint]];
      const unbalanced = ends.reduce((sum, end) => sum + (moments[end] ?? 0), 0);
      const balancing = -unbalanced;
      const increments = {};
      const carryovers = {};
      for (const end of ends) {
        const df = Number(distributionFactors[end] ?? 0);
        const inc = balancing * df;
        moments[end] = (moments[end] ?? 0) + inc;
        increments[end] = inc;
        const far = farEnd(end);
        const factor = zeros.has(end) ? 0 : Number(carryoverFactor);
        const co = factor * inc;
        moments[far] = (moments[far] ?? 0) + co;
        carryovers[`${end}->${far}`] = co;
      }
      trace.push({ cycle, joint, unbalanced, balancing, increments, carryovers });
    }
  }

  const jointResiduals = Object.fromEntries(
    Object.entries(jointEnds).map(([joint, ends]) => [
      joint,
      ends.reduce((sum, end) => sum + (moments[end] ?? 0), 0),
    ]),
  );
  return { endMoments: moments, jointResiduals, trace };
}
