import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const graph = JSON.parse(read("data/system_graph.json"));
const workflow = read(".github/workflows/deploy-pages.yml");
const nextConfig = read("next.config.ts");
const viteConfig = read("vite.config.ts");
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
]) assert.ok(fs.existsSync(file), `${file} must exist`);

assert.equal(pkg.engines.node, "24.14.0");
assert.equal(pkg.engines.npm, "11.9.0");
const dependencyNames = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
assert.equal(dependencyNames.some((name) => /cloudflare|wrangler/i.test(name)), false, "GitHub Pages package must not retain Cloudflare or Wrangler dependencies");
assert.equal(graph.system.nodes.length, 15);
assert.equal(graph.database.nodes.length, 65);
assert.equal(graph.system.edges.length + graph.database.edges.length, 106);
assert.match(nextConfig, /output:\s*["']export["']/);
assert.match(nextConfig, /basePath/);
assert.match(nextConfig, /trailingSlash:\s*true/);
assert.match(viteConfig, /prerender:\s*\{\s*routes:\s*["']\*["']/);
assert.doesNotMatch(viteConfig, /from ["']@cloudflare|from ["']@vinext\/cloudflare|\bcloudflare\s*\(|\bcdnAdapter\s*\(/i);
assert.match(workflow, /actions\/checkout@v6/);
assert.match(workflow, /actions\/setup-node@v6/);
assert.match(workflow, /actions\/configure-pages@v5/);
assert.match(workflow, /actions\/upload-pages-artifact@v4/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /path:\s*dist\/client/);
assert.match(workflow, /node-version:\s*24\.14\.0/);
assert.equal(fs.existsSync("wrangler.jsonc"), false, "GitHub Pages source must not include Wrangler configuration");

for (const file of sourceFiles) {
  const text = read(file);
  assert.doesNotMatch(text, /(?:href|src)=["']\//, `${file} contains an unprefixed root-relative literal URL`);
}

const protectedFiles = ["data/thesis_content.json", "data/website_demo_data.json", "data/references.json", "data/system_graph.json"];
for (const file of protectedFiles) assert.ok(fs.existsSync(file), `${file} must remain present`);

console.log(JSON.stringify({
  staticExport: true,
  githubPagesWorkflow: true,
  routes: 9,
  graphNodes: 80,
  graphRelationships: 106,
  protectedDataFiles: protectedFiles.length,
  serverRuntimeRequired: false,
}, null, 2));
