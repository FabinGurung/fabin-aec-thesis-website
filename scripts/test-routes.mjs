import assert from "node:assert/strict";

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const routes = ["/", "/research", "/system", "/prototype", "/workflow", "/evidence", "/roadmap", "/thesis", "/graph"];
const results = [];

for (const route of routes) {
  const routePath = route === "/" ? `${basePath}/` : `${basePath}${route}/`;
  const response = await fetch(`${baseUrl}${routePath}`);
  const html = await response.text();
  assert.equal(response.status, 200, `${route} must return HTTP 200`);
  assert.equal((html.match(/<h1/g) || []).length, 1, `${route} must have one h1`);
  assert.ok(html.includes("Source disclosure"), `${route} must include a source disclosure`);
  assert.ok(html.includes("Static thesis website"), `${route} must include the static-site label`);
  assert.equal(/href="[^"]+\.pdf/i.test(html), false, `${route} must not link a PDF`);
  assert.equal(/<form\b/i.test(html), false, `${route} must not contain a form`);
  if (route === "/graph") {
    assert.ok(html.includes("not a graph database"), "/graph must retain the graph-database boundary");
    assert.ok(html.includes("not connected live to Supabase"), "/graph must retain the live-connectivity boundary");
  }
  results.push({ route, status: response.status, bytes: Buffer.byteLength(html) });
}

console.log(JSON.stringify({ baseUrl, basePath: basePath || "/", routes: results }, null, 2));
