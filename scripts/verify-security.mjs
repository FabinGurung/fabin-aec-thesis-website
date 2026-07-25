import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const runtimeRoots = ["app", "components", "data", "scripts"];
const textExtensions = /\.(?:css|json|js|mjs|ts|tsx|txt)$/i;
const textFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (textExtensions.test(entry.name)) textFiles.push(absolute);
  }
}

for (const directory of runtimeRoots) walk(path.join(root, directory));
for (const file of [
  "README.md", "SITE_ARCHITECTURE.md", "DATA_SOURCE_MAP.md", "CHANGELOG.md", "MANIFEST_PROCEDURE.md",
  "SITES_RECONNECTION.md", "GITHUB_PAGES_SETUP.md", "GITHUB_PAGES_CONVERSION_REPORT.md", ".github/workflows/deploy-pages.yml",
  "package.json", "package-lock.json", "vite.config.ts", "next.config.ts",
  "tsconfig.json", ".env.example", ".gitignore", ".nvmrc",
]) textFiles.push(path.join(root, file));
const verifierPath = path.join(root, "scripts/verify-security.mjs");
const payloadTextFiles = [...new Set(textFiles)].filter((file) => file !== verifierPath && fs.existsSync(file));
const runtimeText = payloadTextFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const forbiddenPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/, "JWT/access token"],
  [/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"']+/i, "database connection string"],
  [/https:\/\/[a-z0-9]{15,}\.supabase\.co/i, "Supabase project URL"],
  [/supabase\.com\/dashboard|\/project\/[a-z0-9]{10,}/i, "dashboard/project path"],
  [/\b(?:service[_-]?role|sb_(?:secret|publishable)_)\b/i, "Supabase key marker"],
  [/\b(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*["'][^"']+["']/i, "assigned secret value"],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i, "internal UUID"],
  [/\b(?:google-analytics|googletagmanager|gtag\s*\(|posthog|mixpanel|hotjar|plausible\.io)\b/i, "visitor analytics"],
];

for (const [pattern, label] of forbiddenPatterns) {
  assert.equal(pattern.test(runtimeText), false, `${label} must not appear in the application payload`);
}

const envLines = read(".env.example").split(/\r?\n/).filter((line) => line && !line.startsWith("#"));
assert.ok(envLines.every((line) => /^[A-Z][A-Z0-9_]*=$/.test(line)), ".env.example values must all be blank");

const pkg = JSON.parse(read("package.json"));
const packageNames = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join("\n");
assert.equal(/(?:supabase|auth0|clerk|firebase|posthog|segment|mixpanel)/i.test(packageNames), false, "database, authentication or analytics dependencies are not allowed");

assert.equal(fs.existsSync(path.join(root, "wrangler.jsonc")), false, "Wrangler runtime configuration must be absent");
const pagesWorkflow = read(".github/workflows/deploy-pages.yml");
assert.equal(/(?:secrets\.|env:\s*(?:API|TOKEN|SECRET|PASSWORD))/i.test(pagesWorkflow), false, "Pages workflow must not consume repository secrets");

const publicFiles = fs.readdirSync(path.join(root, "public"), { recursive: true }).map(String);
assert.equal(publicFiles.some((file) => /\.(?:pdf|log|env)$/i.test(file)), false, "public assets must not contain PDFs, logs or environment files");
const publicAssetText = publicFiles
  .filter((file) => fs.statSync(path.join(root, "public", file)).isFile())
  .map((file) => fs.readFileSync(path.join(root, "public", file)).toString("latin1"))
  .join("\n");
for (const [pattern, label] of forbiddenPatterns.slice(0, 8)) {
  assert.equal(pattern.test(publicAssetText), false, `${label} must not be embedded in public assets`);
}
assert.equal(fs.existsSync(path.join(root, "data/website_demo_data_original.json")), false, "original private demo data must be absent");

const graphPage = read("app/graph/page.tsx");
assert.match(graphPage, /This is a curated interactive visualization of the thesis system, not a graph database/);
assert.match(graphPage, /not\s+connected live to Supabase/);
assert.match(graphPage, /not machine learning/);
assert.match(graphPage, /does not show all 52 tables and 24 views at once/);
const prototypePage = read("app/prototype/page.tsx");
assert.match(prototypePage, /does not replace ETABS, SAP2000, Abaqus/);

console.log(JSON.stringify({
  scannedTextFiles: payloadTextFiles.length,
  forbiddenPatternMatches: 0,
  requiredRuntimeVariables: 0,
  databaseBindings: 0,
  authenticationDependencies: 0,
  analyticsDependencies: 0,
  publicSensitiveFiles: 0,
  publicEmbeddedSensitiveMatches: 0,
}, null, 2));
