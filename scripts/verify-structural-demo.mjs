import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const demo = path.join(root, "public", "structural-demo");
const required = [
  "index.html", "404.html", "README.md",
  "assets/app.js", "assets/styles.css",
  "solver/mdm.js", "solver/direct-stiffness.js", "solver/floor-efm.js",
  "solver/load-combinations.js", "solver/response-spectrum.js", "solver/matrix.js", "solver/presets.js",
  "tests/solver-regression.mjs",
  "data/validation-summary.json", "data/step12-validation-summary.json", "data/known-discrepancies.json",
  "docs/VALIDATED_SCOPE.md", "docs/PROVENANCE.md", "docs/PUBLICATION_BOUNDARY.md", "docs/RESEARCH_USE_NOTICE.md",
];

for (const rel of required) {
  await readFile(path.join(demo, rel));
}

const index = await readFile(path.join(demo, "index.html"), "utf8");
assert.ok(index.includes('href="../"'), "structural demo must provide a relative link back to the thesis site");
assert.ok(index.includes('src="./assets/app.js"'), "structural demo runtime script must stay relative");
assert.ok(index.includes('href="./assets/styles.css"'), "structural demo stylesheet must stay relative");
assert.equal(/(?:href|src)="\/(?!\/)/.test(index), false, "structural demo must not use project-root absolute asset links");

const parentPage = await readFile(path.join(root, "app", "page.tsx"), "utf8");
const nav = await readFile(path.join(root, "components", "mobile-navigation.tsx"), "utf8");
assert.ok(parentPage.includes('["/structural-demo/", "Structural Solver"'), "overview route card must link structural solver");
assert.ok(nav.includes('["/structural-demo/", "Structural Solver"]'), "primary navigation must link structural solver");
assert.ok(nav.includes('["/methodology-demo/", "Methodology Demo"]'), "methodology demo navigation must be preserved");

const forbidden = [
  /drive\.google\.com/i,
  /GITHUB_TOKEN/,
  /github_pat_[A-Za-z0-9_]+/,
  /ghp_[A-Za-z0-9]+/,
  /BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/,
];

async function walk(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

for (const file of await walk(demo)) {
  if (/\.(?:png|jpg|jpeg|gif|webp|zip)$/i.test(file)) continue;
  const text = await readFile(file, "utf8");
  for (const pattern of forbidden) assert.equal(pattern.test(text), false, `forbidden public token/source pattern in ${path.relative(root, file)}`);
}

const regression = spawnSync(process.execPath, [path.join(demo, "tests", "solver-regression.mjs")], { encoding: "utf8" });
process.stdout.write(regression.stdout || ""); process.stderr.write(regression.stderr || "");
assert.equal(regression.status, 0, "structural solver regression must pass");

const jsFiles = (await walk(demo)).filter((p) => /\.js$/.test(p));
for (const file of jsFiles) {
  const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (check.status !== 0) process.stderr.write(check.stderr || "");
  assert.equal(check.status, 0, `JavaScript syntax check failed: ${path.relative(root, file)}`);
}

for (const rel of ["data/validation-summary.json", "data/step12-validation-summary.json", "data/known-discrepancies.json"]) {
  JSON.parse(await readFile(path.join(demo, rel), "utf8"));
}

console.log(JSON.stringify({
  status: "PASS",
  route: "/structural-demo/",
  requiredFiles: required.length,
  jsSyntaxFiles: jsFiles.length,
  regression: "PASS",
  publicSafety: "PASS",
  methodologyDemoPreserved: true,
}, null, 2));
