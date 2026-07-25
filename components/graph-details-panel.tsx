import type { GraphEdge, GraphNode } from "@/components/graph-types";
import { sitePath } from "@/components/site-path";

type Connection = { node: GraphNode; edge: GraphEdge; direction: "incoming" | "outgoing" };

const statusLabels = {
  implemented: "Implemented",
  validated: "Validated",
  framework: "Framework-level",
  future: "Future work",
} as const;

export function GraphDetailsPanel({
  node,
  connections,
  onSelectNode,
}: {
  node: GraphNode | null;
  connections: Connection[];
  onSelectNode: (node: GraphNode) => void;
}) {
  if (!node) {
    return (
      <aside className="graph-details graph-details-empty" aria-live="polite">
        <p className="kicker">Node details</p>
        <h2>Select a node</h2>
        <p>Choose a node in the graph, search results or relationship list to inspect its source-backed description and connections.</p>
        <ul>
          <li>Drag nodes to inspect dense areas.</li>
          <li>Use Local Graph to isolate up to three relationship depths.</li>
          <li>Future nodes are explicitly dashed and are not implemented.</li>
        </ul>
      </aside>
    );
  }

  return (
    <aside className="graph-details" aria-live="polite" aria-labelledby="selected-node-title">
      <div className="graph-detail-heading">
        <p className="kicker">Selected node</p>
        <span className={`graph-status-label status-${node.status}`}>{statusLabels[node.status]}</span>
      </div>
      <h2 id="selected-node-title">{node.label}</h2>
      <p>{node.description}</p>
      {node.is_group && (
        <p className="graph-expand-help">Press Enter or double-click to expand this group.</p>
      )}

      {node.verified_values && node.verified_values.length > 0 && (
        <dl className="graph-verified-values">
          {node.verified_values.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <dl className="graph-node-metadata">
        <div><dt>Category</dt><dd>{node.category}</dd></div>
        <div><dt>Status</dt><dd>{statusLabels[node.status]}</dd></div>
        {node.database_object && <div><dt>Database table / view</dt><dd><code>{node.database_object}</code></dd></div>}
        <div><dt>Related route</dt><dd><a href={sitePath(node.related_route)}>{node.related_route}</a></dd></div>
        <div><dt>Source</dt><dd><code>{node.source_reference}</code></dd></div>
      </dl>

      <div className="graph-connections">
        <h3>Connected nodes <span>{connections.length}</span></h3>
        {connections.length > 0 ? (
          <ul>
            {connections.map(({ node: connected, edge, direction }) => (
              <li key={`${edge.id}-${connected.id}`}>
                <button type="button" onClick={() => onSelectNode(connected)}>{connected.label}</button>
                <small>
                  {direction === "outgoing" ? `${edge.label} →` : `← ${edge.label}`}
                </small>
              </li>
            ))}
          </ul>
        ) : <p>No connected node remains under the current filters.</p>}
      </div>
    </aside>
  );
}
