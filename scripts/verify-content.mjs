import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const demo = readJson("data/website_demo_data.json");
const graph = readJson("data/system_graph.json");

assert.equal(demo.database_summary.base_table_count, 52);
assert.equal(demo.database_summary.view_count, 24);
assert.equal(demo.diagram_points.length, 52);
assert.equal(demo.architecture_lines.length, 2);
assert.equal(demo.quantity_estimates.length, 2);
assert.equal(demo.work_item_links.length, 10);
assert.equal(demo.method_statement_steps.length, 12);
assert.equal(demo.specification_clauses.length, 10);
assert.equal(demo.quantity_total.quantity, 1.242);

const linksByElement = Object.groupBy(demo.work_item_links, (row) => row.element_label);
assert.equal(linksByElement.AB.length, 5);
assert.equal(linksByElement.BC.length, 5);

const traceOrders = [...new Set(demo.calculation_trace.map((row) => row.step_order))].sort((a, b) => a - b);
assert.deepEqual(traceOrders, [1, 2, 3, 4, 5, 7]);
assert.equal(traceOrders.includes(6), false);

assert.equal(fs.existsSync(path.join(root, "data/website_demo_data_original.json")), false);
const publicFiles = fs.readdirSync(path.join(root, "public"), { recursive: true });
assert.equal(publicFiles.some((file) => /\.pdf$/i.test(String(file))), false);

const evidenceRoot = path.join(root, "public/evidence");
const pngFiles = fs.readdirSync(evidenceRoot).filter((file) => file.endsWith(".png")).sort();
assert.equal(pngFiles.length, 10);
for (const file of pngFiles) {
  const signature = fs.readFileSync(path.join(evidenceRoot, file)).subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", `${file} must be a genuine PNG`);
}

const dataText = [
  fs.readFileSync(path.join(root, "data/website_demo_data.json"), "utf8"),
  fs.readFileSync(path.join(root, "data/thesis_content.json"), "utf8"),
  fs.readFileSync(path.join(root, "data/system_graph.json"), "utf8"),
].join("\n");
assert.equal(/\b(project_id|element_id|solve_case_id|structural_member_id|database_role)\b/i.test(dataText), false);
assert.equal(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(dataText), false);

assert.equal(graph.system.nodes.length, 15);
assert.equal(graph.database.nodes.length, 65);
assert.equal(graph.system.edges.length, 18);
assert.equal(graph.database.edges.length, 88);
assert.equal(graph.groups.length, 7);
for (const graphName of ["system", "database"]) {
  const ids = graph[graphName].nodes.map((node) => node.id);
  assert.equal(new Set(ids).size, ids.length, `${graphName} graph node IDs must be unique`);
  for (const edge of graph[graphName].edges) {
    assert.equal(ids.includes(edge.source), true, `${edge.id} source must exist`);
    assert.equal(ids.includes(edge.target), true, `${edge.id} target must exist`);
    assert.equal(Boolean(edge.label), true, `${edge.id} must have a relationship label`);
  }
}

const databaseLabels = new Set(graph.database.nodes.map((node) => node.label));
for (const requiredLabel of [
  "Projects",
  "Project Points",
  "Project Elements",
  "Fixed End Moments",
  "Final End Moments",
  "MDM Health Check",
  "Beam Concrete Volume",
  "Validation Dashboard",
  "PostGIS",
  "AI Natural-Language Interface",
]) {
  assert.equal(databaseLabels.has(requiredLabel), true, `${requiredLabel} must be represented`);
}

const healthNode = graph.database.nodes.find((node) => node.database_object === "v_mdm_health_check");
assert.deepEqual(healthNode.verified_values, [
  { label: "Maximum joint imbalance", value: "0.000000" },
  { label: "Duplicate stiffness locations", value: "0" },
  { label: "Converged", value: "TRUE" },
  { label: "Solve healthy", value: "TRUE" },
]);

const quantityNode = graph.database.nodes.find((node) => node.database_object === "v_estimate_beam_concrete_volume");
assert.deepEqual(quantityNode.verified_values, [
  { label: "Beam AB", value: "0.621 m³" },
  { label: "Beam BC", value: "0.621 m³" },
  { label: "Total", value: "1.242 m³" },
]);

const postgisNode = graph.database.nodes.find((node) => node.label === "PostGIS");
assert.equal(postgisNode.status, "future");
assert.match(postgisNode.description, /Not implemented in the current prototype/);

const graphPage = fs.readFileSync(path.join(root, "app/graph/page.tsx"), "utf8");
assert.match(graphPage, /not a graph database/);
assert.match(graphPage, /not\s+connected live to Supabase/);
const mobileNavigation = fs.readFileSync(path.join(root, "components/mobile-navigation.tsx"), "utf8");
assert.equal(mobileNavigation.includes('["/graph", "System Graph"]'), true);
assert.equal((mobileNavigation.match(/\["\/[^"]*", "[^"]+"\]/g) ?? []).length, 9);
assert.equal(mobileNavigation.includes("SWIPE FOR / USE ARROW KEYS"), false);
assert.equal(mobileNavigation.includes("Swipe or use arrow keys"), false);
assert.match(mobileNavigation, /has-overflow-right/);
assert.match(mobileNavigation, /remaining > 2/);
assert.match(mobileNavigation, /ArrowLeft/);
assert.match(mobileNavigation, /ArrowRight/);

const graphControls = fs.readFileSync(path.join(root, "components/graph-controls.tsx"), "utf8");
assert.match(graphControls, /How to use this graph/);
for (const helpTopic of ["Zoom", "Pan", "Drag", "Select", "Global \/ Local", "Search", "Filter", "Depth", "Reset", "Fit to view"]) {
  assert.match(graphControls, new RegExp(`<strong>${helpTopic}<\\/strong>`));
}

const graphDetails = fs.readFileSync(path.join(root, "components/graph-details-panel.tsx"), "utf8");
assert.equal(graphDetails.includes(' · ${edge.aggregate_count} documented relationships'), false);
assert.match(graphDetails, /Press Enter or double-click to expand this group/);

const graphComponent = fs.readFileSync(path.join(root, "components/system-graph.tsx"), "utf8");
assert.match(graphComponent, /Enter \/ double-click to expand/);
assert.match(graphComponent, /Press Enter or double-click to expand this group/);
const styles = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
assert.match(styles, /\.graph-node \.group-expand-hint \{[\s\S]*?opacity: 0/);
assert.match(styles, /\.graph-node:is\(:hover, \.is-hovered, \.is-selected, :focus\) \.group-expand-hint/);
assert.match(styles, /scroll-padding-top: var\(--mobile-sticky-header-offset\)/);

console.log(
  JSON.stringify(
    {
      databaseObjects: demo.database_summary.base_table_count + demo.database_summary.view_count,
      diagramPoints: demo.diagram_points.length,
      evidencePngs: pngFiles.length,
      workItemLinks: demo.work_item_links.length,
      traceOrders,
      publicPdfs: 0,
      internalUuidFields: 0,
      graphNodes: graph.system.nodes.length + graph.database.nodes.length,
      graphEdges: graph.system.edges.length + graph.database.edges.length,
      graphRoute: "/graph",
    },
    null,
    2,
  ),
);
