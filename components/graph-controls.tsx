import type { GraphGroup, GraphMode, GraphNode, GraphStatus, GraphTab } from "@/components/graph-types";

type GraphControlsProps = {
  tab: GraphTab;
  mode: GraphMode;
  depth: 1 | 2 | 3;
  query: string;
  category: string;
  status: "all" | GraphStatus;
  categories: string[];
  searchResults: GraphNode[];
  groups: GraphGroup[];
  expandedGroups: Set<string>;
  selectedNode: GraphNode | null;
  nodeCount: number;
  edgeCount: number;
  onTabChange: (tab: GraphTab) => void;
  onModeChange: (mode: GraphMode) => void;
  onDepthChange: (depth: 1 | 2 | 3) => void;
  onQueryChange: (query: string) => void;
  onSearchSelect: (node: GraphNode) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: "all" | GraphStatus) => void;
  onToggleGroup: (groupId: string) => void;
  onResetLayout: () => void;
  onFitView: () => void;
  onZoom: (factor: number) => void;
};

export function GraphControls({
  tab,
  mode,
  depth,
  query,
  category,
  status,
  categories,
  searchResults,
  groups,
  expandedGroups,
  selectedNode,
  nodeCount,
  edgeCount,
  onTabChange,
  onModeChange,
  onDepthChange,
  onQueryChange,
  onSearchSelect,
  onCategoryChange,
  onStatusChange,
  onToggleGroup,
  onResetLayout,
  onFitView,
  onZoom,
}: GraphControlsProps) {
  const selectFirstResult = () => {
    const first = searchResults[0];
    if (first) onSearchSelect(first);
  };

  return (
    <div className="graph-controls" aria-label="Graph controls">
      <div className="graph-tabs" role="tablist" aria-label="Graph dataset">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "system"}
          className={tab === "system" ? "active" : ""}
          onClick={() => onTabChange("system")}
        >
          System Graph
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "database"}
          className={tab === "database" ? "active" : ""}
          onClick={() => onTabChange("database")}
        >
          Database Graph
        </button>
      </div>

      <div className="graph-control-row">
        <fieldset className="segmented-control">
          <legend>Graph mode</legend>
          <button
            type="button"
            aria-pressed={mode === "global"}
            className={mode === "global" ? "active" : ""}
            onClick={() => onModeChange("global")}
          >
            Global Graph
          </button>
          <button
            type="button"
            aria-pressed={mode === "local"}
            aria-describedby={!selectedNode ? "local-mode-help" : undefined}
            disabled={!selectedNode}
            className={mode === "local" ? "active" : ""}
            onClick={() => onModeChange("local")}
          >
            Local Graph
          </button>
        </fieldset>

        <fieldset className="segmented-control depth-control" disabled={mode !== "local"}>
          <legend>Local depth</legend>
          {([1, 2, 3] as const).map((value) => (
            <button
              type="button"
              aria-pressed={depth === value}
              className={depth === value ? "active" : ""}
              onClick={() => onDepthChange(value)}
              key={value}
            >
              Depth {value}
            </button>
          ))}
        </fieldset>
        <span className="graph-count" aria-live="polite">{nodeCount} nodes · {edgeCount} relationships</span>
      </div>
      {!selectedNode && <p className="control-help" id="local-mode-help">Select a node to enable Local Graph.</p>}

      <div className="graph-filter-grid">
        <div className="graph-search">
          <label htmlFor="graph-search">Search node name</label>
          <div className="graph-search-input">
            <input
              id="graph-search"
              type="search"
              value={query}
              placeholder="e.g. MDM Health Check"
              autoComplete="off"
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  selectFirstResult();
                }
              }}
            />
            {query && <button type="button" onClick={() => onQueryChange("")} aria-label="Clear node search">Clear</button>}
          </div>
          {query && searchResults.length > 0 && (
            <div className="graph-search-results" aria-label="Matching nodes">
              {searchResults.slice(0, 6).map((node) => (
                <button type="button" key={node.id} onClick={() => onSearchSelect(node)}>
                  <span>{node.label}</span><small>{node.category}</small>
                </button>
              ))}
            </div>
          )}
          {query && searchResults.length === 0 && <p className="control-help" role="status">No node name matches that search.</p>}
        </div>

        <label>
          Category
          <select value={category} onChange={(event) => onCategoryChange(event.currentTarget.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Implementation status
          <select value={status} onChange={(event) => onStatusChange(event.currentTarget.value as "all" | GraphStatus)}>
            <option value="all">All statuses</option>
            <option value="implemented">Implemented</option>
            <option value="validated">Validated</option>
            <option value="framework">Framework-level</option>
            <option value="future">Future work</option>
          </select>
        </label>
      </div>

      {tab === "database" && (
        <fieldset className="group-controls">
          <legend>Expand or collapse database groups</legend>
          {groups.map((group) => (
            <button
              type="button"
              aria-pressed={expandedGroups.has(group.id)}
              className={expandedGroups.has(group.id) ? "active" : ""}
              onClick={() => onToggleGroup(group.id)}
              key={group.id}
            >
              <span aria-hidden="true">{expandedGroups.has(group.id) ? "−" : "+"}</span>
              {group.label}
            </button>
          ))}
        </fieldset>
      )}

      <div className="graph-action-row">
        {mode === "local" && <button type="button" className="graph-primary-action" onClick={() => onModeChange("global")}>Return to Global Graph</button>}
        <button type="button" onClick={onResetLayout}>Reset Layout</button>
        <button type="button" onClick={onFitView}>Fit to View</button>
        <span className="zoom-controls" aria-label="Zoom controls">
          <button type="button" onClick={() => onZoom(0.82)} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => onZoom(1.22)} aria-label="Zoom in">+</button>
        </span>
      </div>

      <details className="graph-help-disclosure">
        <summary>How to use this graph</summary>
        <ul>
          <li><strong>Zoom</strong><span>Scroll the canvas or use the + and − buttons.</span></li>
          <li><strong>Pan</strong><span>Drag an empty area of the graph background.</span></li>
          <li><strong>Drag</strong><span>Drag a node to reposition it within the current layout.</span></li>
          <li><strong>Select</strong><span>Select a node to open its source-backed details and connections.</span></li>
          <li><strong>Global / Local</strong><span>Use Global for the curated overview and Local for a selected neighborhood.</span></li>
          <li><strong>Search</strong><span>Find a node by name; hidden database groups expand when needed.</span></li>
          <li><strong>Filter</strong><span>Narrow nodes by category or implementation status.</span></li>
          <li><strong>Depth</strong><span>Choose one, two or three relationship levels in Local Graph.</span></li>
          <li><strong>Reset</strong><span>Restore deterministic starting positions.</span></li>
          <li><strong>Fit to view</strong><span>Reframe all currently visible nodes inside the canvas.</span></li>
        </ul>
      </details>
    </div>
  );
}
