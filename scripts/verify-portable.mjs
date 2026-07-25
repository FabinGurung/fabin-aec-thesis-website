import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

assert.equal(exists(".openai/hosting.json"), false, "private hosted-project association must be absent from portable source");

for (const required of [
  ".env.example", ".nvmrc", ".gitignore", "README.md", "SITE_ARCHITECTURE.md", "DATA_SOURCE_MAP.md",
  "CHANGELOG.md", "SITES_RECONNECTION.md", "MANIFEST_PROCEDURE.md", "MANIFEST.json", "package.json",
  "package-lock.json", "tsconfig.json", "vite.config.ts", "next.config.ts", "data/system_graph.json",
  "GITHUB_PAGES_SETUP.md", "GITHUB_PAGES_CONVERSION_REPORT.md", ".github/workflows/deploy-pages.yml", "public/.nojekyll", "components/site-path.ts",
  "components/system-graph.tsx", "components/graph-controls.tsx", "components/graph-legend.tsx",
  "components/graph-details-panel.tsx", "components/graph-types.ts", "components/mobile-navigation.tsx",
  "scripts/test-routes.mjs", "scripts/verify-content.mjs", "scripts/verify-security.mjs",
  "scripts/generate-manifest.mjs", "scripts/verify-manifest.mjs", "scripts/verify-portable.mjs",
  "scripts/verify-github-pages.mjs", "scripts/verify-pages-output.mjs",
]) assert.equal(exists(required), true, `${required} is required`);

const pkg = JSON.parse(read("package.json"));
assert.equal(pkg.engines.node, "24.14.0");
assert.equal(pkg.engines.npm, "11.9.0");
assert.equal(pkg.packageManager, "npm@11.9.0");
assert.equal(pkg.dependencies.vinext, "1.0.0-beta.2");
assert.equal(pkg.dependencies.react, "19.2.7");
assert.equal(pkg.devDependencies.vite, "8.1.5");
assert.equal(pkg.devDependencies.typescript, "7.0.2");

const envLines = read(".env.example").split(/\r?\n/).filter((line) => line && !line.startsWith("#"));
assert.ok(envLines.every((line) => /^[A-Z][A-Z0-9_]*=$/.test(line)), ".env.example assignments must be blank");

const routeFiles = [
  "app/page.tsx", "app/research/page.tsx", "app/system/page.tsx", "app/prototype/page.tsx",
  "app/workflow/page.tsx", "app/evidence/page.tsx", "app/roadmap/page.tsx", "app/thesis/page.tsx", "app/graph/page.tsx",
];
assert.ok(routeFiles.every(exists), "all nine route files must be present");

const graph = JSON.parse(read("data/system_graph.json"));
assert.equal(graph.system.nodes.length, 15);
assert.equal(graph.database.nodes.length, 65);
assert.equal(graph.system.edges.length + graph.database.edges.length, 106);

assert.equal(exists(".git"), false, ".git must be absent from portable source");
const manifest = JSON.parse(read("MANIFEST.json"));
const generatedDirectories = ["node_modules", "dist", ".next", ".vinext", ".wrangler"];
assert.equal(exists("wrangler.jsonc"), false, "Wrangler configuration must be absent from the GitHub Pages package");
for (const directory of generatedDirectories) {
  assert.equal(manifest.files.some((file) => file.path === directory || file.path.startsWith(`${directory}/`)), false, `${directory} must not be part of the portable payload`);
}

console.log(JSON.stringify({
  routeFiles: routeFiles.length,
  graphNodes: graph.system.nodes.length + graph.database.nodes.length,
  graphRelationships: graph.system.edges.length + graph.database.edges.length,
  requiredNode: pkg.engines.node,
  packageManager: pkg.packageManager,
  hostedProjectAssociationIncluded: false,
  generatedDirectoriesPresentLocally: generatedDirectories.filter(exists),
  generatedDirectoriesIncludedInPayload: 0,
}, null, 2));
