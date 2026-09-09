import { solveMomentDistribution } from "../solver/mdm.js";
import { solveFrame } from "../solver/direct-stiffness.js";
import { lateralDistribution, spanPositiveAndReactions, supportFaceNegative } from "../solver/floor-efm.js";
import { generateLoadCombinations } from "../solver/load-combinations.js";
import { principalDirectionScaling, srss } from "../solver/response-spectrum.js";
import { dsf01, mdm01 } from "../solver/presets.js";

const $ = (id) => document.getElementById(id);
const fmt = (value, digits = 6) => Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined, { maximumFractionDigits: digits }) : String(value);
const show = (id, value) => { $(id).textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2); };
const safe = (fn, outputId) => { try { fn(); } catch (error) { show(outputId, `ERROR: ${error.message}`); } };

function runMdm() {
  const model = structuredClone(mdm01);
  model.cycles = Number($("mdmCycles").value);
  const out = solveMomentDistribution(model);
  const residual = Math.max(...Object.values(out.jointResiduals).map(Math.abs));
  $("mdmResidual").textContent = fmt(residual, 8);
  $("mdmAB").textContent = fmt(out.endMoments.AB, 5);
  $("mdmDG").textContent = fmt(out.endMoments.DG, 5);
  show("mdmOutput", { endMoments: out.endMoments, jointResiduals: out.jointResiduals, trace: out.trace });
}

function runDsf() {
  const model = structuredClone(dsf01);
  model.nodalLoads[0].Fx = Number($("dsfFx").value);
  model.nodalLoads[0].Fy = Number($("dsfFy").value);
  model.members.forEach((m) => { m.E = Number($("dsfE").value); m.A = Number($("dsfA").value); m.I = Number($("dsfI").value); });
  const out = solveFrame(model.nodes, model.members, model.nodalLoads);
  const index = Object.fromEntries(out.nodeIds.map((id, i) => [id, i]));
  const dofs = (id) => out.U.slice(3 * index[id], 3 * index[id] + 3);
  const b = dofs("B"); const c = dofs("C");
  $("dsfBx").textContent = fmt(b[0], 8); $("dsfCy").textContent = fmt(c[1], 8); $("dsfRz").textContent = fmt(out.R[2], 3);
  show("dsfOutput", { nodeDisplacements: { B: b, C: c }, reactions: out.R.slice(0, 3), elementLocalForces: Object.fromEntries(Object.entries(out.elements).map(([k, v]) => [k, v.localF])) });
}

function runLc() {
  const inputs = Object.fromEntries(["DL","LL","Ex","Ey","Z","Sso"].map((id) => [id, Number($("lc" + id).value)]));
  inputs.EParallel = inputs.Ex; inputs.additionalLoadType = $("lcAdditional").value; inputs.usage = $("lcUsage").value;
  const out = generateLoadCombinations(inputs);
  $("lcLambda").textContent = inputs.usage === "storage" ? "0.6" : "0.3";
  $("lcMain").textContent = fmt(out.lsmParallel["1.2DL + 1.5LL"], 4);
  $("lcVertical").textContent = fmt(out.verticalSeismic.coefficientOnDL, 5);
  show("lcOutput", out);
}

function runSeis() {
  const inputs = {
    designBaseShearKips: Number($("seisDesign").value), minimumDynamicBaseShearKips: Number($("seisMin").value),
    unscaledMajor: { V_kips: Number($("seisMajorV").value), M_ft_kips: Number($("seisMajorM").value) },
    unscaledMinor: { V_kips: Number($("seisMinorV").value), M_ft_kips: Number($("seisMinorM").value) },
  };
  const out = principalDirectionScaling(inputs);
  const orth = srss([Number($("seisSx").value), Number($("seisSy").value)]);
  $("seisFactor").textContent = fmt(out.scaleFactor, 6); $("seisMajorScaled").textContent = fmt(out.scaledMajor.V_kips, 4); $("seisSrss").textContent = fmt(orth, 6);
  show("seisOutput", { ...out, orthogonalSrss: orth });
}

function runFloor() {
  const w = Number($("floorW").value), L = Number($("floorL").value), ml = Number($("floorML").value), mr = Number($("floorMR").value);
  const span = spanPositiveAndReactions(w, L, ml, mr);
  const face = supportFaceNegative(ml, span.VLKip, w, Number($("floorOffset").value));
  const lat = lateralDistribution(Number($("floorMoment").value), Number($("floorColumnPct").value), Number($("floorBeamShare").value));
  $("floorMplus").textContent = fmt(span.MplusFtKip, 6); $("floorVL").textContent = fmt(span.VLKip, 6); $("floorBeam").textContent = fmt(lat.beamStripMomentFtKip, 6);
  show("floorOutput", { span, supportFaceNegativeFtKip: face, lateralDistribution: lat });
}

$("runMdm").addEventListener("click", () => safe(runMdm, "mdmOutput"));
$("runDsf").addEventListener("click", () => safe(runDsf, "dsfOutput"));
$("runLc").addEventListener("click", () => safe(runLc, "lcOutput"));
$("runSeis").addEventListener("click", () => safe(runSeis, "seisOutput"));
$("runFloor").addEventListener("click", () => safe(runFloor, "floorOutput"));

runMdm(); runDsf(); runLc(); runSeis(); runFloor();
