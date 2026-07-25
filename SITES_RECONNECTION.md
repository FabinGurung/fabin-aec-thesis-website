# Reconnecting This Archive to the Existing ChatGPT Site

## Why `.openai/hosting.json` is absent

The active Sites workspace uses `.openai/hosting.json` to associate the source repository with an existing hosted project. That identifier is deployment metadata rather than portable application source, so this public-portable archive intentionally omits the file.

No hosted project identifier, repository credential, access token or bypass token is recorded elsewhere in the archive.

## Safe reconnection procedure

1. Extract the archive into a trusted ChatGPT Work Mode workspace.
2. Invoke `@Sites` and explicitly request reconnection to the **existing Fabin Gurung thesis Site**, not creation of a new Site.
3. Let Sites retrieve the association through the authenticated workspace and restore `.openai/hosting.json` locally.
4. Keep that file ignored by source control and excluded from every portable/public archive.
5. Confirm Node.js 24.14.0 and npm 11.9.0; run `npm ci`, `npm run test:portable` before reconnection or `npm run test` after reconnection, and `npm run build`.
6. Start `npm run preview`, run `npm run test:routes`, and inspect all nine routes plus the graph interactions in a real browser.
7. Query the authenticated Sites access policy and compare it with the approved current policy. Preserve its visibility, allowed users, groups and authentication settings exactly; this archive deliberately makes no access-policy claim.
8. Push the exact tested source commit to the existing Sites repository.
9. Save a new Sites version, retain the previous version as rollback, and deploy only with explicit authorization.
10. After deployment, repeat the production route, graph, mobile, console, data-integrity and access-policy checks. Restore the retained version immediately if verification fails.

## Files and values that remain private

- `.openai/hosting.json`
- short-lived source-repository credentials
- Sites bypass or deployment tokens
- any future nonblank environment values or secrets
- authenticated access-policy identities

Never put these values into `.env.example`, documentation, screenshots, manifests, ZIP archives or public source control.
