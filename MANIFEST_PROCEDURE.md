# Manifest Generation and Verification Procedure

## Hash algorithm

Every payload checksum uses SHA-256 over the exact file bytes.

## Payload list

`MANIFEST.json` lists all portable payload files in sorted relative-path order. These items are excluded by design:

- `MANIFEST.json` from the ordinary payload list, because raw byte-for-byte self-hashing is recursive
- `.git/` and `.openai/`
- `node_modules/`, `dist/`, `.next/`, `.vinext/`, `.wrangler/` and `coverage/`
- archives, logs, TypeScript build information, operating-system metadata, temporary screenshots and browser profiles

This procedure document is an ordinary payload file, so its byte size and checksum are included in `MANIFEST.json`.

## Manifest self-integrity

The manifest contains `manifest_integrity` with:

- `mode`: `sha256-canonical-json-null-self-field`
- `procedure_file`: `MANIFEST_PROCEDURE.md`
- `sha256`: the normalized self-integrity checksum

Generation and verification use this deterministic procedure:

1. Parse or construct the manifest value.
2. Set `manifest_integrity.sha256` to JSON `null`.
3. Serialize with `JSON.stringify(value, null, 2)` and append one newline.
4. SHA-256 hash those UTF-8 bytes.
5. Store or compare the hexadecimal checksum in `manifest_integrity.sha256`.

The normalized self-hash covers all manifest metadata and payload checksums without claiming an impossible raw self-checksum.

## Commands

After every approved payload change, regenerate:

```bash
npm run manifest
```

Then verify:

```bash
npm run verify:manifest
```

The verifier checks the normalized self-hash, every listed file checksum and byte size, sorted unique paths, payload count, total payload bytes, absence of unlisted payload files and exclusion of the private hosting association.

The final ZIP SHA-256 is calculated after packaging and reported separately. It is not embedded in the ZIP.
