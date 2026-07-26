import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const output = path.resolve("out");

const basePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ?? ""
).replace(/\/$/, "");

const routes = [
  "",
  "research",
  "system",
  "prototype",
  "workflow",
  "evidence",
  "roadmap",
  "thesis",
  "graph",
];

assert.ok(
  fs.existsSync(output),
  "out must exist after the static build",
);

assert.ok(
  fs.existsSync(path.join(output, ".nojekyll")),
  ".nojekyll must be copied into the Pages artifact",
);

function routeFile(route) {
  const candidates = route
    ? [path.join(output, route, "index.html"), path.join(output, `${route}.html`)]
    : [path.join(output, "index.html")];
  return candidates.find(fs.existsSync);
}

const verified = [];
for (const route of routes) {
  const file = routeFile(route);
  assert.ok(file, `static HTML output missing for /${route}`);
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /<h1\b/i, `/${route} must include an h1`);
  assert.doesNotMatch(html, /\.pdf(?:["'?#])/i, `/${route} must not expose a PDF download`);

  if (basePath) {
    const urlPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
    for (const match of html.matchAll(urlPattern)) {
      const url = match[1];
      if (!url.startsWith("/") || url.startsWith("//")) continue;
      assert.ok(
        url === basePath || url.startsWith(`${basePath}/`),
        `/${route} has a root URL outside the configured base path: ${url}`,
      );
    }
  }

  verified.push({ route: `/${route}`, file: path.relative(output, file), bytes: Buffer.byteLength(html) });
}

console.log(JSON.stringify({ output, basePath: basePath || "/", routes: verified }, null, 2));
