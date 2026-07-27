/* Optional repository QA: run with `node tests/static-package.test.cjs`. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const references = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(
  (match) => match[1]
);
const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(
  new Set(htmlIds).size,
  htmlIds.length,
  "Duplicate HTML IDs are not allowed"
);

const htmlIdSet = new Set(htmlIds);
[...html.matchAll(/(?:aria-controls|aria-labelledby)="([^"]+)"/g)]
  .flatMap((match) => match[1].split(/\s+/))
  .forEach((id) => {
    assert.equal(htmlIdSet.has(id), true, `Missing ARIA target: ${id}`);
  });
[...html.matchAll(/href="#([^"]+)"/g)].forEach((match) => {
  assert.equal(htmlIdSet.has(match[1]), true, `Missing hash target: ${match[1]}`);
});

references.forEach((reference) => {
  assert.equal(
    reference.startsWith("/"),
    false,
    `Root-relative reference is not GitHub Pages safe: ${reference}`
  );
  const resolved = path.resolve(root, reference);
  assert.equal(
    resolved.startsWith(root),
    true,
    `Reference escapes package root: ${reference}`
  );
  assert.equal(fs.existsSync(resolved), true, `Missing referenced file: ${reference}`);
});

const files = [];
function walk(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(item);
    else files.push(item);
  });
}
walk(root);
assert.equal(fs.existsSync(path.join(root, ".nojekyll")), true, ".nojekyll is required");

const scanText = files
  .filter(
    (file) =>
      /\.(?:html|css|js|cjs|md)$/i.test(file) &&
      path.resolve(file) !== path.resolve(__filename)
  )
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

[
  /AKIA[0-9A-Z]{16}/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /https?:\/\/[^/\s]+\.supabase\.co/i,
  /\/workspace\/|\/root\/\.codex\//
].forEach((pattern) => {
  assert.equal(pattern.test(scanText), false, `Sensitive pattern detected: ${pattern}`);
});

const runtimeText = files
  .filter((file) => /\.(?:html|css|js)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n")
  .replaceAll("http://www.w3.org/2000/svg", "");
assert.equal(
  /(?:https?:\/\/|localhost|127\.0\.0\.1)/i.test(runtimeText),
  false,
  "Runtime files must not depend on absolute or local-development URLs"
);

console.log(
  `PASS ${references.length} relative references, ${htmlIds.length} unique IDs and ${files.length} package files.`
);
