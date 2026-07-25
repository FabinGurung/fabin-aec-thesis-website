import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "MANIFEST.json");
const excludedDirectories = new Set([".git", ".openai", "node_modules", "dist", ".next", ".vinext", ".wrangler", "coverage"]);
const excludedFilePatterns = [/^MANIFEST\.json$/, /\.zip$/i, /\.tar\.gz$/i, /\.log$/i, /\.tsbuildinfo$/i, /^\.DS_Store$/];
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

function collect(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collect(absolute, relative));
    else if (!excludedFilePatterns.some((pattern) => pattern.test(relative) || pattern.test(entry.name))) files.push(relative);
  }
  return files;
}

const paths = collect(root).sort();
const files = paths.map((relativePath) => {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  return { path: relativePath, bytes: bytes.length, sha256: sha256(bytes) };
});

const manifest = {
  schema_version: "2.0",
  archive_name: "fabin-aec-thesis-website-github-pages-v2.1.zip",
  generated_at_utc: new Date().toISOString(),
  source_snapshot: {
    release: "v2.1 — GitHub Pages Static Export",
    routes: 9,
    system_graph_nodes: 15,
    database_graph_nodes: 65,
    labelled_relationships: 106,
    hosting: "GitHub Pages static export",
    server_runtime_required: false,
  },
  hash_algorithm: "SHA-256",
  payload_file_count: files.length,
  total_payload_bytes: files.reduce((sum, file) => sum + file.bytes, 0),
  exclusions: [
    "MANIFEST.json from ordinary payload list; covered by normalized self-integrity",
    ".git/", ".openai/", "node_modules/", "dist/", ".next/", ".vinext/", ".wrangler/", "coverage/",
    "archives, logs, TypeScript build info, operating-system metadata, temporary screenshots and browser profiles",
  ],
  manifest_integrity: {
    mode: "sha256-canonical-json-null-self-field",
    procedure_file: "MANIFEST_PROCEDURE.md",
    sha256: null,
  },
  files,
};

const canonical = `${JSON.stringify(manifest, null, 2)}\n`;
manifest.manifest_integrity.sha256 = sha256(Buffer.from(canonical, "utf8"));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ path: manifestPath, payloadFileCount: files.length, totalPayloadBytes: manifest.total_payload_bytes, manifestIntegrity: manifest.manifest_integrity.sha256 }, null, 2));
