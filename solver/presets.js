export const mdm01 = {
  initialEndMoments: {
    AB: 1.3333333333333333, BA: -1.3333333333333333, BC: 4.444444444444445, CB: -2.2222222222222223,
    CD: 6.666666666666667, DC: -6.666666666666667, BE: 0, EB: 0, CF: 5, FC: -5, DG: 0, GD: 0,
  },
  jointEnds: { D: ["DC", "DG"], C: ["CB", "CD", "CF"], B: ["BA", "BC", "BE"] },
  distributionFactors: { BA: 0.428, BC: 0.286, BE: 0.286, CB: 0.276, CD: 0.414, CF: 0.31, DC: 0.5, DG: 0.5 },
  jointOrder: ["D", "C", "B"], cycles: 3, zeroCarryoverFrom: ["CF"],
  preAdjustments: [{ end: "FC", delta: 5, farEnd: "CF", farDelta: 2.5 }],
};

export const dsf01 = {
  nodes: {
    A: { x: 0, y: 0, restraints: { ux: true, uy: true, rz: true } },
    B: { x: 0, y: 3000, restraints: { ux: false, uy: false, rz: false } },
    C: { x: 4000, y: 3000, restraints: { ux: false, uy: false, rz: false } },
  },
  members: [
    { id: "AB", i: "A", j: "B", E: 200000, A: 10000, I: 100000000 },
    { id: "BC", i: "B", j: "C", E: 200000, A: 10000, I: 100000000 },
  ],
  nodalLoads: [{ node: "C", Fx: 10000, Fy: -20000, Mz: 0 }],
};
