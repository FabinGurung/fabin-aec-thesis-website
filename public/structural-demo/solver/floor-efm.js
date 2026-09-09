const PAIR = { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4 };
const JOINTS = [[0], [1, 2], [3, 4], [5]];
const DFS = [[0.395], [0.306, 0.306], [0.306, 0.306], [0.395]];
const COL_DF = DFS.map((group) => 1 - group.reduce((a, b) => a + b, 0));
const COF = 0.507;

export function floorMomentDistribution(fem, distributionStages = 5) {
  if (fem.length !== 6) throw new Error("FLOOR-01 reproduction requires six member-end FEM values");
  if (!Number.isInteger(distributionStages) || distributionStages < 1) throw new Error("distributionStages must be >= 1");
  let moments = fem.map(Number);
  let columnBranch = Array(4).fill(0);
  const trace = [];
  for (let stage = 1; stage <= distributionStages; stage += 1) {
    const dist = Array(6).fill(0);
    const colDist = Array(4).fill(0);
    JOINTS.forEach((indices, joint) => {
      const unbalanced = columnBranch[joint] + indices.reduce((sum, i) => sum + moments[i], 0);
      indices.forEach((i, k) => { dist[i] = -unbalanced * DFS[joint][k]; });
      colDist[joint] = -unbalanced * COL_DF[joint];
    });
    moments = moments.map((value, i) => value + dist[i]);
    columnBranch = columnBranch.map((value, i) => value + colDist[i]);
    const record = { stage, distribution: dist, equivalentColumnDistribution: colDist };
    if (stage < distributionStages) {
      const carryover = Array(6).fill(0);
      dist.forEach((value, i) => { carryover[PAIR[i]] += value * COF; });
      moments = moments.map((value, i) => value + carryover[i]);
      record.carryover = carryover;
    }
    trace.push(record);
  }
  return { memberEndMoments: moments, equivalentColumnJointMoments: columnBranch, trace };
}

export function spanPositiveAndReactions(wKlf, LFt, MLNeg, MRNeg) {
  const w = Number(wKlf); const L = Number(LFt); const ml = Number(MLNeg); const mr = Number(MRNeg);
  if (!(w > 0) || !(L > 0)) throw new Error("wKlf and LFt must be positive");
  const mPlus = w * L ** 2 / 8 - (ml + mr) / 2 + (ml - mr) ** 2 / (2 * w * L ** 2);
  const x = L / 2 + (ml - mr) / (w * L);
  const vLeft = w * L / 2 + (ml - mr) / L;
  const vRight = w * L / 2 - (ml - mr) / L;
  return { MplusFtKip: mPlus, xFtFromLeft: x, VLKip: vLeft, VRKip: vRight };
}

export function supportFaceNegative(centerlineNeg, reactionKip, wKlf, faceOffsetFt = 0.75) {
  return Number(centerlineNeg) - Number(reactionKip) * Number(faceOffsetFt) + Number(wKlf) * Number(faceOffsetFt) ** 2 / 2;
}

export function lateralDistribution(factoredMoment, columnStripPercent, beamShareFraction = 0.85) {
  const column = Number(factoredMoment) * Number(columnStripPercent) / 100;
  const beam = column * Number(beamShareFraction);
  return {
    columnStripMomentFtKip: column,
    beamStripMomentFtKip: beam,
    columnStripRemainderFtKip: column - beam,
    twoHalfMiddleStripsMomentFtKip: Number(factoredMoment) - column,
  };
}
