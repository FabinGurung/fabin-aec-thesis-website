import assert from "node:assert/strict";
import { solveMomentDistribution } from "../solver/mdm.js";
import { solveFrame } from "../solver/direct-stiffness.js";
import { lateralDistribution, spanPositiveAndReactions, supportFaceNegative } from "../solver/floor-efm.js";
import { generateLoadCombinations } from "../solver/load-combinations.js";
import { principalDirectionScaling, srss } from "../solver/response-spectrum.js";
import { dsf01, mdm01 } from "../solver/presets.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

const mdm = solveMomentDistribution(mdm01);
const expectedMdm = { AB: 1.087, BA: -1.826, BC: 2.157, CB: -6.302, CD: 3.197, DC: -4.797, BE: -0.329, EB: -0.165, CF: 3.105, FC: 0, DG: 4.798, GD: 2.4 };
for (const [k, v] of Object.entries(expectedMdm)) near(mdm.endMoments[k], v, 0.01);
assert.ok(Math.max(...Object.values(mdm.jointResiduals).map(Math.abs)) <= 0.01);

const dsf = solveFrame(dsf01.nodes, dsf01.members, dsf01.nodalLoads);
const idx = Object.fromEntries(dsf.nodeIds.map((id, i) => [id, i]));
const nodeDofs = (id) => dsf.U.slice(3 * idx[id], 3 * idx[id] + 3);
[22.5, -0.03, -0.01425].forEach((v, i) => near(nodeDofs("B")[i], v, 3e-9));
[22.52, -78.36333333333333, -0.02225].forEach((v, i) => near(nodeDofs("C")[i], v, 3e-9));
[-10000, 20000, 110000000].forEach((v, i) => near(dsf.R[i], v, 1e-3));

const floor = lateralDistribution(100, 60, 0.85);
assert.deepEqual(floor, { columnStripMomentFtKip: 60, beamStripMomentFtKip: 51, columnStripRemainderFtKip: 9, twoHalfMiddleStripsMomentFtKip: 40 });
const span = spanPositiveAndReactions(2, 20, 30, 20);
near(span.VLKip + span.VRKip, 40, 1e-12);
assert.ok(supportFaceNegative(30, span.VLKip, 2, 0.75) < 30);

const lc = generateLoadCombinations({ DL: 100, LL: 50, Ex: 20, Ey: 10, EParallel: 20, Z: 0.30, Sso: 10, additionalLoadType: "snow", usage: "other" });
assert.equal(lc.lsmParallel["1.2DL + 1.5LL"], 195);
assert.deepEqual(lc.lsmParallel["DL + λLL ± E"], [95, 135]);
assert.deepEqual(lc.lsmNonparallel["DL + λLL ± Ex ± 0.3Ey"], [92, 98, 132, 138]);
near(lc.verticalSeismic.coefficientOnDL, 1.3, 1e-12);
assert.deepEqual(lc.verticalSeismic.combinationPlusMinusE, [125, 165]);
assert.equal(lc.workingStress["DL + LL + S"], 160);

const scaled = principalDirectionScaling({ designBaseShearKips: 300, minimumDynamicBaseShearKips: 75, unscaledMajor: { V_kips: 75, M_ft_kips: 4000 }, unscaledMinor: { V_kips: 80, M_ft_kips: 4500 } });
assert.equal(scaled.scaleFactor, 4);
assert.deepEqual(scaled.scaledMajor, { V_kips: 300, M_ft_kips: 16000 });
assert.deepEqual(scaled.scaledMinor, { V_kips: 320, M_ft_kips: 18000 });
assert.equal(srss([120, 50]), 130);
assert.equal(srss([9, 12]), 15);

console.log("solver-regression: PASS (MDM, DSF, FLOOR, LC, SEIS)");
