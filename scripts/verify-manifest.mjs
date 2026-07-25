import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "MANIFEST.json"), "utf8"));
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const excludedDirectories = new Set([".git", ".openai", "node_modules", "dist", ".next", ".vinext", ".wrangler", "coverage"]);
const excludedFilePatterns = [/^MANIFEST\.json$/, /\.zip$/i, /\.tar\.gz$/i, /\.log$/i, /\.tsbuildinfo$/i, /^\.DS_Store$/];

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

const canonical = structuredClone(manifest);
const expectedSelfHash = canonical.manifest_integrity.sha256;
canonical.manifest_integrity.sha256 = null;
const actualSelfHash = sha256(Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`, "utf8"));
assert.equal(actualSelfHash, expectedSelfHash, "manifest normalized self-integrity mismatch");
assert.equal(manifest.hash_algorithm, "SHA-256");
assert.equal(manifest.manifest_integrity.procedure_file, "MANIFEST_PROCEDURE.md");

const paths = manifest.files.map((file) => file.path);
assert.deepEqual(paths, [...paths].sort(), "manifest paths must be sorted");
assert.equal(new Set(paths).size, paths.length, "manifest paths must be unique");
assert.equal(paths.includes("MANIFEST.json"), false, "manifest must use normalized self-integrity");
assert.equal(paths.some((file) => file.startsWith(".openai/")), false, "private hosting association must not be listed");
assert.deepEqual(paths, collect(root).sort(), "manifest must list every current payload file exactly once");

let totalBytes = 0;
for (const file of manifest.files) {
  const bytes = fs.readFileSync(path.join(root, file.path));
  totalBytes += bytes.length;
  assert.equal(bytes.length, file.bytes, `${file.path} byte count mismatch`);
  assert.equal(sha256(bytes), file.sha256, `${file.path} checksum mismatch`);
}

assert.equal(manifest.payload_file_count, manifest.files.length, "payload file count mismatch");
assert.equal(manifest.total_payload_bytes, totalBytes, "total payload byte count mismatch");
console.log(JSON.stringify({ verifiedPayloadFiles: manifest.files.length, verifiedPayloadBytes: totalBytes, manifestSelfHash: actualSelfHash, hostedProjectAssociationListed: false }, null, 2));
