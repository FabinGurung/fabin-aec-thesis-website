/* Optional repository QA: run with `node tests/model-integrity.test.cjs`. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
global.window = {};

[
  "data/provenance.js",
  "data/aec-model.js",
  "js/data-access.js",
  "js/integrity.js"
].forEach((relativePath) => {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  vm.runInThisContext(source, { filename: relativePath });
});

const report = window.AEC.integrity.validate();
const close = (actual, expected, tolerance = 1e-9) =>
  Math.abs(actual - expected) <= tolerance;
assert.equal(
  report.passed,
  true,
  report.checks
    .filter((check) => !check.passed)
    .map((check) => check.name)
    .join(", ")
);

const runtime = window.AEC.query.runtime({
  sandbox: { enabled: false, lengthAB: 6 },
  viewer: { levelHeight: 3 }
});
const ab = runtime.analysis.results.BEAM_AB;
const bc = runtime.analysis.results.BEAM_BC;

assert.equal(ab.nearMoment, -37.5);
assert.equal(ab.farMoment, 15);
assert.equal(bc.nearMoment, -15);
assert.equal(bc.farMoment, -7.5);
assert.equal(ab.nearReaction, 38.75);
assert.equal(ab.farReaction, 21.25);
assert.equal(bc.nearReaction, 1.25);
assert.equal(bc.farReaction, -1.25);
assert.equal(runtime.analysis.joint.finalImbalance, 0);
assert.equal(close(runtime.concreteTotal, 1.242), true);
assert.equal(close(ab.stiffness, (4 * 25000) / 6), true);
assert.equal(close(bc.stiffness, (4 * 25000) / 6), true);
assert.equal(close(ab.distributionFactor, 0.5), true);
assert.equal(close(bc.distributionFactor, 0.5), true);
assert.equal(close(ab.femNear, -(10 * 6 ** 2) / 12), true);
assert.equal(close(ab.femFar, (10 * 6 ** 2) / 12), true);
assert.equal(close(ab.nearReaction + ab.farReaction, 10 * 6), true);
assert.equal(close(bc.nearReaction + bc.farReaction, 0), true);
assert.equal(close(ab.momentAt(6), ab.farMoment), true);
assert.equal(close(bc.momentAt(6), bc.farMoment), true);
assert.equal(close(ab.criticalX, 3.875), true);
assert.equal(close(ab.criticalMoment, 37.578125), true);
assert.equal(close(ab.shearAt(0), 38.75), true);
assert.equal(close(ab.shearAt(6), -21.25), true);
assert.equal(close(bc.shearAt(0), 1.25), true);
assert.equal(close(bc.shearAt(6), 1.25), true);
assert.equal(ab.axialAt(3), 0);
assert.equal(bc.axialAt(3), 0);

const sandbox = window.AEC.query.runtime({
  sandbox: { enabled: true, lengthAB: 8 },
  viewer: { levelHeight: 3 }
});
assert.equal(sandbox.elements.find((item) => item.id === "BEAM_AB").length, 8);
assert.equal(sandbox.elements.find((item) => item.id === "BEAM_BC").length, 6);
assert.equal(
  sandbox.quantities.find((item) => item.elementId === "BEAM_AB").status,
  "illustrative"
);
assert.equal(close(sandbox.analysis.joint.finalImbalance, 0), true);

console.log(
  `PASS ${report.passedCount}/${report.totalCount} integrity checks; baseline and sandbox propagation verified.`
);
