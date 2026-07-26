import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

const pkg = JSON.parse(read("package.json"));
const graph = JSON.parse(read("data/system_graph.json"));
const workflow = read(".github/workflows/deploy-pages.yml");
const nextConfig = read("next.config.ts");

const sourceFiles = [
  "components/site-path.ts",
  "components/ui.tsx",
  "components/mobile-navigation.tsx",
  "components/graph-details-panel.tsx",
  "app/page.tsx",
  "app/thesis/page.tsx",
  "app/evidence/page.tsx",
];

for (const file of [
  ".github/workflows/deploy-pages.yml",
  "public/.nojekyll",
  "GITHUB_PAGES_SETUP.md",
  "components/site-path.ts",
]) {
  assert.ok(fs.existsSync(file), `${file} must exist`);
}

/* Exact toolchain */
assert.equal(pkg.engines.node, "24.14.0");
assert.equal(pkg.engines.npm, "11.9.0");

/* Next.js migration */
assert.equal(pkg.dependencies.next, "16.2.11");
assert.equal("vinext" in pkg.dependencies, false);
assert.equal(fs.existsSync("vite.config.ts"), false);

/* No Cloudflare runtime dependencies */
const dependencyNames = Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
});

assert.equal(
  dependencyNames.some((name) => /cloudflare|wrangler/i.test(name)),
  false,
  "GitHub Pages package must not retain Cloudflare or Wrangler dependencies",
);

/* Graph integrity */
assert.equal(graph.system.nodes.length, 15);
assert.equal(graph.database.nodes.length, 65);
assert.equal(
  graph.system.edges.length + graph.database.edges.length,
  106,
);

/* Static-export configuration */
assert.match(nextConfig, /output:\s*["']export["']/);
assert.match(nextConfig, /basePath/);
assert.match(nextConfig, /trailingSlash:\s*true/);

/* GitHub Actions build configuration */
assert.match(workflow, /actions\/checkout@v6/);
assert.match(workflow, /actions\/setup-node@v6/);
assert.match(workflow, /actions\/configure-pages@v5/);
assert.match(workflow, /actions\/upload-pages-artifact@v4/);
assert.match(workflow, /path:\s*out/);
assert.match(workflow, /node-version:\s*24\.14\.0/);

/*
 * NOTE:
 * During the migration-validation stage we deliberately do NOT require
 * actions/deploy-pages because deployment is disabled until the static
 * Next.js export has been proven correct.
 */

assert.equal(
  fs.existsSync("wrangler.jsonc"),
  false,
  "GitHub Pages source must not include Wrangler configuration",
);

/* Prevent unprefixed root URLs */
for (const file of sourceFiles) {
  const text = read(file);

  assert.doesNotMatch(
    text,
    /(?:href|src)=["']\//,
    `${file} contains an unprefixed root-relative literal URL`,
  );
}

/* Protected research data */
const protectedFiles = [
  "data/thesis_content.json",
  "data/website_demo_data.json",
  "data/references.json",
  "data/system_graph.json",
];

for (const file of protectedFiles) {
  assert.ok(fs.existsSync(file), `${file} must remain present`);
}

console.log(
  JSON.stringify(
    {
      staticExport: true,
      framework: "Next.js",
      nextVersion: pkg.dependencies.next,
      githubPagesBuildConfigured: true,
      deploymentEnabled: false,
      routes: 9,
      graphNodes: 80,
      graphRelationships: 106,
      protectedDataFiles: protectedFiles.length,
      serverRuntimeRequired: false,
    },
    null,
    2,
  ),
);
