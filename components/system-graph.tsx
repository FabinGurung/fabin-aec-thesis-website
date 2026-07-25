"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import graphJson from "@/data/system_graph.json";
import { GraphControls } from "@/components/graph-controls";
import { GraphDetailsPanel } from "@/components/graph-details-panel";
import { GraphLegend } from "@/components/graph-legend";
import type {
  GraphDataset,
  GraphEdge,
  GraphGroup,
  GraphMode,
  GraphNode,
  GraphStatus,
  GraphTab,
} from "@/components/graph-types";

const graphData = graphJson as GraphDataset;
const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 720;
const GROUP_ORDER = ["research", "shared", "structural", "mdm", "reporting", "outputs", "future"];

type Position = { x: number; y: number };
type Velocity = { x: number; y: number };
type Transform = { x: number; y: number; k: number };
type DragState =
  | { kind: "pan"; pointerId: number; start: Position; origin: Transform }
  | { kind: "node"; pointerId: number; nodeId: string }
  | null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function groupCenter(group: string | undefined) {
  const index = Math.max(0, GROUP_ORDER.indexOf(group ?? "shared"));
  const angle = (index / GROUP_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  const radiusX = 370;
  const radiusY = 225;
  return {
    x: VIEW_WIDTH / 2 + Math.cos(angle) * radiusX,
    y: VIEW_HEIGHT / 2 + Math.sin(angle) * radiusY,
  };
}

function seedLayout(nodes: GraphNode[], tab: GraphTab): Record<string, Position> {
  const positions: Record<string, Position> = {};
  nodes.forEach((node, index) => {
    const seed = hashString(node.id);
    if (tab === "system") {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const ring = index % 3 === 0 ? 245 : 300;
      positions[node.id] = {
        x: VIEW_WIDTH / 2 + Math.cos(angle) * ring + ((seed % 31) - 15),
        y: VIEW_HEIGHT / 2 + Math.sin(angle) * ring * 0.72 + (((seed >>> 5) % 31) - 15),
      };
      return;
    }
    const center = groupCenter(node.group ?? node.id.replace(/^group-/, ""));
    const angle = ((seed % 360) / 180) * Math.PI;
    const radius = node.is_group ? 0 : 48 + (seed % 90);
    positions[node.id] = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius * 0.75,
    };
  });
  return positions;
}

function makeGroupNode(group: GraphGroup): GraphNode {
  return {
    id: `group-${group.id}`,
    label: group.label,
    category: group.label,
    group: group.id,
    status: group.status,
    tone: group.tone,
    shape: "group",
    description: `${group.description} Expand this group to inspect its curated nodes.`,
    related_route: group.related_route,
    source_reference: group.source_reference,
    is_group: true,
  };
}

function buildDatabaseDisplay(expandedGroups: Set<string>) {
  const nodeById = new Map(graphData.database.nodes.map((node) => [node.id, node]));
  const mapEndpoint = (nodeId: string) => {
    const node = nodeById.get(nodeId);
    if (!node?.group || expandedGroups.has(node.group)) return nodeId;
    return `group-${node.group}`;
  };

  const nodes = graphData.groups.flatMap((group) =>
    expandedGroups.has(group.id)
      ? graphData.database.nodes.filter((node) => node.group === group.id)
      : [makeGroupNode(group)],
  );

  const edgesByKey = new Map<string, GraphEdge>();
  for (const edge of graphData.database.edges) {
    const source = mapEndpoint(edge.source);
    const target = mapEndpoint(edge.target);
    if (source === target) continue;
    const futureClass = edge.relationship_type === "future-foundation" ? "future" : "current";
    const key = `${source}|${target}|${futureClass}`;
    const existing = edgesByKey.get(key);
    if (existing) {
      const count = (existing.aggregate_count ?? 1) + 1;
      edgesByKey.set(key, {
        ...existing,
        label: `${count} documented relationships`,
        relationship_type: existing.relationship_type === "future-foundation" ? "future-foundation" : "aggregate",
        aggregate_count: count,
      });
    } else {
      edgesByKey.set(key, { ...edge, id: `display-${key}`, source, target, aggregate_count: 1 });
    }
  }
  return { nodes, edges: [...edgesByKey.values()] };
}

function localNodeIds(selectedId: string, depth: 1 | 2 | 3, nodes: GraphNode[], edges: GraphEdge[]) {
  const allowed = new Set(nodes.map((node) => node.id));
  if (!allowed.has(selectedId)) return new Set<string>();
  const visited = new Set([selectedId]);
  let frontier = new Set([selectedId]);
  for (let level = 0; level < depth; level += 1) {
    const next = new Set<string>();
    for (const edge of edges) {
      if (frontier.has(edge.source) && allowed.has(edge.target) && !visited.has(edge.target)) next.add(edge.target);
      if (frontier.has(edge.target) && allowed.has(edge.source) && !visited.has(edge.source)) next.add(edge.source);
    }
    next.forEach((id) => visited.add(id));
    frontier = next;
  }
  return visited;
}

function nodeRadius(node: GraphNode) {
  if (node.shape === "group") return 72;
  if (node.shape === "concept") return 50;
  if (node.shape === "check") return 64;
  if (node.shape === "output") return 68;
  return 67;
}

function wrappedLabel(label: string, maxCharacters = 17) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharacters || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 3) return lines;
  return [lines[0], lines[1], `${lines.slice(2).join(" ").slice(0, maxCharacters - 1)}…`];
}

function NodeShape({ node }: { node: GraphNode }) {
  if (node.shape === "concept") return <circle r="48" />;
  if (node.shape === "check") return <polygon points="0,-49 63,0 0,49 -63,0" />;
  if (node.shape === "output") return <polygon points="-54,-39 54,-39 68,0 54,39 -54,39 -68,0" />;
  if (node.shape === "group") return <rect x="-72" y="-43" width="144" height="86" rx="23" />;
  return <rect x="-67" y="-38" width="134" height="76" rx={node.shape === "view" ? 18 : 9} />;
}

export function SystemGraph() {
  const [tab, setTab] = useState<GraphTab>("system");
  const [mode, setMode] = useState<GraphMode>("global");
  const [depth, setDepth] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | GraphStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set(graphData.groups.filter((group) => group.default_expanded).map((group) => group.id)),
  );
  const [layoutRevision, setLayoutRevision] = useState(0);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState>(null);
  const positionsRef = useRef<Record<string, Position>>({});
  const velocitiesRef = useRef<Record<string, Velocity>>({});

  const displayGraph = useMemo(
    () => tab === "system" ? graphData.system : buildDatabaseDisplay(expandedGroups),
    [tab, expandedGroups],
  );
  const displayNodeById = useMemo(
    () => new Map(displayGraph.nodes.map((node) => [node.id, node])),
    [displayGraph.nodes],
  );
  const categories = useMemo(
    () => [...new Set(displayGraph.nodes.map((node) => node.category))].sort(),
    [displayGraph.nodes],
  );

  const filteredGraph = useMemo(() => {
    const nodes = displayGraph.nodes.filter((node) =>
      (category === "all" || node.category === category) && (status === "all" || node.status === status),
    );
    const ids = new Set(nodes.map((node) => node.id));
    const edges = displayGraph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
    return { nodes, edges };
  }, [displayGraph, category, status]);

  const viewGraph = useMemo(() => {
    if (mode === "global" || !selectedId) return filteredGraph;
    const ids = localNodeIds(selectedId, depth, filteredGraph.nodes, filteredGraph.edges);
    const nodes = filteredGraph.nodes.filter((node) => ids.has(node.id));
    const edges = filteredGraph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
    return { nodes, edges };
  }, [filteredGraph, mode, selectedId, depth]);

  const viewNodeById = useMemo(
    () => new Map(viewGraph.nodes.map((node) => [node.id, node])),
    [viewGraph.nodes],
  );
  const selectedNode = selectedId ? displayNodeById.get(selectedId) ?? null : null;
  const visibleKey = `${tab}|${mode}|${depth}|${category}|${status}|${[...expandedGroups].sort().join(",")}|${viewGraph.nodes.map((node) => node.id).join(",")}`;

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    const searchPool = tab === "database" ? graphData.database.nodes : displayGraph.nodes;
    return searchPool
      .filter((node) =>
        (category === "all" || node.category === category) && (status === "all" || node.status === status),
      )
      .filter((node) => node.label.toLocaleLowerCase().includes(normalized))
      .sort((a, b) => {
        const aStarts = a.label.toLocaleLowerCase().startsWith(normalized) ? 0 : 1;
        const bStarts = b.label.toLocaleLowerCase().startsWith(normalized) ? 0 : 1;
        return aStarts - bStarts || a.label.localeCompare(b.label);
      });
  }, [tab, displayGraph.nodes, category, status, query]);

  const queryMatches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return new Set(
      normalized
        ? viewGraph.nodes.filter((node) => node.label.toLocaleLowerCase().includes(normalized)).map((node) => node.id)
        : [],
    );
  }, [query, viewGraph.nodes]);

  const focusId = hoveredId && viewNodeById.has(hoveredId)
    ? hoveredId
    : selectedId && viewNodeById.has(selectedId)
      ? selectedId
      : null;
  const focusNeighborhood = useMemo(() => {
    if (!focusId) return new Set<string>();
    const ids = new Set([focusId]);
    viewGraph.edges.forEach((edge) => {
      if (edge.source === focusId) ids.add(edge.target);
      if (edge.target === focusId) ids.add(edge.source);
    });
    return ids;
  }, [focusId, viewGraph.edges]);

  const connections = useMemo(() => {
    if (!selectedNode) return [];
    const result: Array<{ node: GraphNode; edge: GraphEdge; direction: "incoming" | "outgoing" }> = [];
    for (const edge of viewGraph.edges) {
      if (edge.source === selectedNode.id) {
        const node = viewNodeById.get(edge.target);
        if (node) result.push({ node, edge, direction: "outgoing" });
      } else if (edge.target === selectedNode.id) {
        const node = viewNodeById.get(edge.source);
        if (node) result.push({ node, edge, direction: "incoming" });
      }
    }
    return result.sort((a, b) => a.node.label.localeCompare(b.node.label));
  }, [selectedNode, viewGraph.edges, viewNodeById]);

  const fitPositions = useCallback((positions: Record<string, Position>, nodes = viewGraph.nodes) => {
    if (nodes.length === 0) {
      setTransform({ x: 0, y: 0, k: 1 });
      return;
    }
    const points = nodes.map((node) => positions[node.id]).filter(Boolean);
    if (points.length === 0) return;
    const padding = 105;
    const minX = Math.min(...points.map((point) => point.x)) - padding;
    const maxX = Math.max(...points.map((point) => point.x)) + padding;
    const minY = Math.min(...points.map((point) => point.y)) - padding;
    const maxY = Math.max(...points.map((point) => point.y)) + padding;
    const scale = clamp(Math.min(VIEW_WIDTH / Math.max(maxX - minX, 1), VIEW_HEIGHT / Math.max(maxY - minY, 1)), 0.35, 1.7);
    setTransform({
      k: scale,
      x: VIEW_WIDTH / 2 - ((minX + maxX) / 2) * scale,
      y: VIEW_HEIGHT / 2 - ((minY + maxY) / 2) * scale,
    });
  }, [viewGraph.nodes]);

  const [positions, setPositions] = useState<Record<string, Position>>(() => {
    const initial = seedLayout(graphData.system.nodes, "system");
    positionsRef.current = initial;
    return initial;
  });

  useEffect(() => {
    const seeded = seedLayout(viewGraph.nodes, tab);
    const next = { ...positionsRef.current };
    viewGraph.nodes.forEach((node) => {
      if (!next[node.id]) next[node.id] = seeded[node.id];
    });
    positionsRef.current = next;
    setPositions({ ...next });
    const frame = requestAnimationFrame(() => fitPositions(next, viewGraph.nodes));
    return () => cancelAnimationFrame(frame);
  }, [visibleKey, tab, fitPositions, viewGraph.nodes]);

  useEffect(() => {
    if (!selectedId || !viewNodeById.has(selectedId)) return;
    const frame = requestAnimationFrame(() => {
      const selectedPosition = positionsRef.current[selectedId];
      if (!selectedPosition) return;
      setTransform((current) => {
        const scale = mode === "local" ? Math.max(current.k, 0.75) : current.k;
        return {
          k: scale,
          x: VIEW_WIDTH / 2 - selectedPosition.x * scale,
          y: VIEW_HEIGHT / 2 - selectedPosition.y * scale,
        };
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId, mode, depth, visibleKey, viewNodeById]);

  useEffect(() => {
    if (selectedId && !filteredGraph.nodes.some((node) => node.id === selectedId)) {
      setSelectedId(null);
      setMode("global");
    }
  }, [filteredGraph.nodes, selectedId]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || viewGraph.nodes.length < 2) return;
    let frame = 0;
    let cancelled = false;
    let alpha = 1;
    const ids = viewGraph.nodes.map((node) => node.id);
    const nodeMap = new Map(viewGraph.nodes.map((node) => [node.id, node]));
    const maxFrames = tab === "database" ? 260 : 220;

    const step = () => {
      const current = positionsRef.current;
      const forces: Record<string, Position> = Object.fromEntries(ids.map((id) => [id, { x: 0, y: 0 }]));

      for (let left = 0; left < ids.length; left += 1) {
        for (let right = left + 1; right < ids.length; right += 1) {
          const a = current[ids[left]];
          const b = current[ids[right]];
          if (!a || !b) continue;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 16) {
            dx += ((hashString(`${ids[left]}-${ids[right]}`) % 11) - 5) * 0.8;
            dy += ((hashString(`${ids[right]}-${ids[left]}`) % 11) - 5) * 0.8;
            distanceSquared = Math.max(dx * dx + dy * dy, 16);
          }
          const distance = Math.sqrt(distanceSquared);
          const combinedRadius = nodeRadius(nodeMap.get(ids[left])!) + nodeRadius(nodeMap.get(ids[right])!) + 24;
          const repulsion = (distance < combinedRadius ? 9200 : 4600) / distanceSquared;
          const fx = (dx / distance) * repulsion * alpha;
          const fy = (dy / distance) * repulsion * alpha;
          forces[ids[left]].x -= fx;
          forces[ids[left]].y -= fy;
          forces[ids[right]].x += fx;
          forces[ids[right]].y += fy;
        }
      }

      for (const edge of viewGraph.edges) {
        const source = current[edge.source];
        const target = current[edge.target];
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const desired = edge.aggregate_count && edge.aggregate_count > 1 ? 230 : 180;
        const spring = (distance - desired) * 0.0019 * alpha;
        const fx = (dx / distance) * spring;
        const fy = (dy / distance) * spring;
        forces[edge.source].x += fx;
        forces[edge.source].y += fy;
        forces[edge.target].x -= fx;
        forces[edge.target].y -= fy;
      }

      for (const id of ids) {
        const node = nodeMap.get(id)!;
        const position = current[id];
        const target = tab === "database"
          ? groupCenter(node.group ?? id.replace(/^group-/, ""))
          : { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };
        const groupingStrength = tab === "database" ? 0.0016 : 0.0008;
        forces[id].x += (target.x - position.x) * groupingStrength * alpha;
        forces[id].y += (target.y - position.y) * groupingStrength * alpha;

        if (dragRef.current?.kind === "node" && dragRef.current.nodeId === id) continue;
        const velocity = velocitiesRef.current[id] ?? { x: 0, y: 0 };
        velocity.x = (velocity.x + forces[id].x) * 0.84;
        velocity.y = (velocity.y + forces[id].y) * 0.84;
        velocitiesRef.current[id] = velocity;
        position.x = clamp(position.x + velocity.x, -180, VIEW_WIDTH + 180);
        position.y = clamp(position.y + velocity.y, -160, VIEW_HEIGHT + 160);
      }

      positionsRef.current = current;
      setPositions({ ...current });
      alpha *= 0.982;
      frame += 1;
      if (!cancelled && frame < maxFrames && alpha > 0.012) requestAnimationFrame(step);
    };

    const animationFrame = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [visibleKey, layoutRevision, tab, viewGraph.edges, viewGraph.nodes]);

  const selectNode = useCallback((node: GraphNode) => {
    if (tab === "database" && node.group && !node.is_group && !expandedGroups.has(node.group)) {
      setExpandedGroups((current) => new Set(current).add(node.group!));
    }
    setSelectedId(node.id);
    setHoveredId(null);
  }, [tab, expandedGroups]);

  const changeTab = (nextTab: GraphTab) => {
    setTab(nextTab);
    setSelectedId(null);
    setHoveredId(null);
    setMode("global");
    setQuery("");
    setCategory("all");
    setStatus("all");
    setLayoutRevision((value) => value + 1);
  };

  const toggleGroup = (groupId: string) => {
    const isExpanded = expandedGroups.has(groupId);
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
    if (isExpanded && selectedNode?.group === groupId) setSelectedId(`group-${groupId}`);
    setMode("global");
    setLayoutRevision((value) => value + 1);
  };

  const resetLayout = () => {
    const next = seedLayout(viewGraph.nodes, tab);
    positionsRef.current = next;
    velocitiesRef.current = {};
    setPositions(next);
    fitPositions(next);
    setLayoutRevision((value) => value + 1);
  };

  const zoomBy = (factor: number) => {
    setTransform((current) => {
      const nextScale = clamp(current.k * factor, 0.3, 3.2);
      return {
        k: nextScale,
        x: VIEW_WIDTH / 2 - (VIEW_WIDTH / 2 - current.x) * (nextScale / current.k),
        y: VIEW_HEIGHT / 2 - (VIEW_HEIGHT / 2 - current.y) * (nextScale / current.k),
      };
    });
  };

  const svgPoint = (clientX: number, clientY: number) => {
    const rectangle = svgRef.current?.getBoundingClientRect();
    if (!rectangle) return { x: 0, y: 0 };
    return {
      x: ((clientX - rectangle.left) / rectangle.width) * VIEW_WIDTH,
      y: ((clientY - rectangle.top) / rectangle.height) * VIEW_HEIGHT,
    };
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const point = svgPoint(event.clientX, event.clientY);
    const factor = event.deltaY > 0 ? 0.88 : 1.14;
    setTransform((current) => {
      const nextScale = clamp(current.k * factor, 0.3, 3.2);
      const graphX = (point.x - current.x) / current.k;
      const graphY = (point.y - current.y) / current.k;
      return { k: nextScale, x: point.x - graphX * nextScale, y: point.y - graphY * nextScale };
    });
  };

  const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "pan",
      pointerId: event.pointerId,
      start: svgPoint(event.clientX, event.clientY),
      origin: transform,
    };
  };

  const handleNodePointerDown = (event: ReactPointerEvent<SVGGElement>, node: GraphNode) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = { kind: "node", pointerId: event.pointerId, nodeId: node.id };
    selectNode(node);
    setLayoutRevision((value) => value + 1);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = svgPoint(event.clientX, event.clientY);
    if (drag.kind === "pan") {
      setTransform({
        ...drag.origin,
        x: drag.origin.x + point.x - drag.start.x,
        y: drag.origin.y + point.y - drag.start.y,
      });
      return;
    }
    const graphPoint = {
      x: (point.x - transform.x) / transform.k,
      y: (point.y - transform.y) / transform.k,
    };
    positionsRef.current[drag.nodeId] = graphPoint;
    velocitiesRef.current[drag.nodeId] = { x: 0, y: 0 };
    setPositions({ ...positionsRef.current });
  };

  const endPointerInteraction = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleNodeKeyDown = (event: ReactKeyboardEvent<SVGGElement>, node: GraphNode) => {
    if (event.key === "Enter" && node.is_group && node.group) {
      event.preventDefault();
      toggleGroup(node.group);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode(node);
    }
  };

  const statusLabel = (node: GraphNode) => node.status === "framework" ? "Framework-level" : node.status === "future" ? "Future work" : node.status[0].toUpperCase() + node.status.slice(1);
  const occupiedLabelBoxes: Array<{ left: number; right: number; top: number; bottom: number }> = [];

  return (
    <div className="system-graph">
      <GraphControls
        tab={tab}
        mode={mode}
        depth={depth}
        query={query}
        category={category}
        status={status}
        categories={categories}
        searchResults={searchResults}
        groups={graphData.groups}
        expandedGroups={expandedGroups}
        selectedNode={selectedNode}
        nodeCount={viewGraph.nodes.length}
        edgeCount={viewGraph.edges.length}
        onTabChange={changeTab}
        onModeChange={setMode}
        onDepthChange={setDepth}
        onQueryChange={setQuery}
        onSearchSelect={selectNode}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onToggleGroup={toggleGroup}
        onResetLayout={resetLayout}
        onFitView={() => fitPositions(positionsRef.current)}
        onZoom={zoomBy}
      />

      <GraphLegend />

      <div className="graph-layout">
        <div className="graph-canvas-shell">
          <div className="graph-canvas-instructions" id="graph-canvas-help">
            Select a node · drag to pan or reposition · use +/− to zoom
          </div>
          <svg
            ref={svgRef}
            className="graph-canvas"
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            role="application"
            aria-label={`${tab === "system" ? "System" : "Database"} relationship graph with ${viewGraph.nodes.length} visible nodes`}
            aria-describedby="graph-canvas-help"
            onWheel={handleWheel}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPointerInteraction}
            onPointerCancel={endPointerInteraction}
          >
            <defs>
              <pattern id="graph-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.2" cy="1.2" r="1.2" />
              </pattern>
              <marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 8 4 L 0 8 z" />
              </marker>
            </defs>
            <rect className="graph-grid-background" width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#graph-grid)" />
            <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
              <g className="graph-edges" aria-hidden="true">
                {viewGraph.edges.map((edge, edgeIndex) => {
                  const source = positions[edge.source];
                  const target = positions[edge.target];
                  if (!source || !target) return null;
                  const isFocused = !focusId || edge.source === focusId || edge.target === focusId;
                  const isDirectRelationship = Boolean(focusId && (edge.source === focusId || edge.target === focusId));
                  const overviewStride = Math.max(1, Math.ceil(viewGraph.edges.length / 7));
                  const showOverviewLabel = !focusId && edgeIndex % overviewStride === 0;
                  const showLabel = isDirectRelationship || showOverviewLabel;
                  const future = edge.relationship_type === "future-foundation";
                  const deltaX = target.x - source.x;
                  const deltaY = target.y - source.y;
                  const distance = Math.max(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 1);
                  const offsetDirection = hashString(edge.id) % 2 === 0 ? 1 : -1;
                  const labelOffset = (isDirectRelationship ? 14 : 10) * offsetDirection;
                  const labelText = isDirectRelationship || edge.label.length <= 28
                    ? edge.label
                    : `${edge.label.slice(0, 27)}…`;
                  const labelWidth = clamp(labelText.length * (isDirectRelationship ? 5.7 : 5.1) + 14, 48, isDirectRelationship ? 230 : 170);
                  const labelCandidateSpecs: Array<{ progress: number; offset: number; fixedX?: number; fixedY?: number }> = [];
                  const progressValues = [0.5, 0.42, 0.58, 0.36, 0.64, 0.28, 0.72, 0.15, 0.85];
                  const offsetMultipliers = [1, -1, 1.7, -1.7, 2.2, -2.2, 3.2, -3.2, 5, -5, 6.5, -6.5, 8, -8, 10, -10, 13, -13, 16, -16, 20, -20];
                  for (const progress of progressValues) {
                    for (const multiplier of offsetMultipliers) {
                      labelCandidateSpecs.push({ progress, offset: labelOffset * multiplier });
                    }
                  }
                  if (isDirectRelationship) {
                    const fallbackXs = [labelWidth / 2 + 16, VIEW_WIDTH / 2, VIEW_WIDTH - labelWidth / 2 - 16];
                    const fallbackYs = [42, 96, 150, 204, 258, 312, 366, 420, 474, 528, 578];
                    for (const fixedY of fallbackYs) {
                      for (const fixedX of fallbackXs) {
                        labelCandidateSpecs.push({ progress: 0.5, offset: 0, fixedX, fixedY });
                      }
                    }
                  }
                  const labelCandidates = labelCandidateSpecs.map(({ progress, offset, fixedX, fixedY }) => {
                    const anchorX = source.x + deltaX * progress;
                    const anchorY = source.y + deltaY * progress;
                    const x = fixedX ?? anchorX - (deltaY / distance) * offset;
                    const y = fixedY ?? anchorY + (deltaX / distance) * offset;
                    const overlapScore = viewGraph.nodes.reduce((score, node) => {
                      const nodePosition = positions[node.id];
                      if (!nodePosition) return score;
                      const radius = nodeRadius(node);
                      const overlapsHorizontally = Math.abs(x - nodePosition.x) < radius + labelWidth / 2 + 10;
                      const overlapsVertically = Math.abs(y - nodePosition.y) < radius + 18;
                      return score + (overlapsHorizontally && overlapsVertically ? 1 : 0);
                    }, 0);
                    const candidateBox = {
                      left: x - labelWidth / 2 - 4,
                      right: x + labelWidth / 2 + 4,
                      top: y - 14,
                      bottom: y + 14,
                    };
                    const labelOverlapScore = occupiedLabelBoxes.reduce((score, placed) => {
                      const overlaps = candidateBox.left < placed.right
                        && candidateBox.right > placed.left
                        && candidateBox.top < placed.bottom
                        && candidateBox.bottom > placed.top;
                      return score + (overlaps ? 1 : 0);
                    }, 0);
                    const boundaryPenalty = x - labelWidth / 2 < 8 || x + labelWidth / 2 > VIEW_WIDTH - 8 || y < 18 || y > VIEW_HEIGHT - 18 ? 1 : 0;
                    const displacementPenalty = Math.hypot(x - anchorX, y - anchorY) / 1000;
                    return {
                      x,
                      y,
                      anchorX,
                      anchorY,
                      score: boundaryPenalty * 1_000_000 + (overlapScore + labelOverlapScore) * 10_000 + labelOverlapScore * 100 + displacementPenalty,
                    };
                  });
                  const labelPosition = labelCandidates.reduce((best, candidate) => candidate.score < best.score ? candidate : best);
                  if (showLabel) {
                    occupiedLabelBoxes.push({
                      left: labelPosition.x - labelWidth / 2 - 4,
                      right: labelPosition.x + labelWidth / 2 + 4,
                      top: labelPosition.y - 14,
                      bottom: labelPosition.y + 14,
                    });
                  }
                  return (
                    <g className={`${!isFocused ? "is-dimmed" : ""} ${future ? "edge-future" : ""}`} key={edge.id}>
                      <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} markerEnd="url(#graph-arrow)" />
                      {showLabel && (
                        <g
                          className={`graph-edge-label ${isDirectRelationship ? "is-prominent" : "is-overview"}`}
                          transform={`translate(${labelPosition.x} ${labelPosition.y})`}
                        >
                          {isDirectRelationship && Math.hypot(labelPosition.anchorX - labelPosition.x, labelPosition.anchorY - labelPosition.y) > 38 && (
                            <line
                              className="graph-label-leader"
                              x1={labelPosition.anchorX - labelPosition.x}
                              y1={labelPosition.anchorY - labelPosition.y}
                              x2="0"
                              y2="0"
                            />
                          )}
                          <rect x={-labelWidth / 2} y="-10" width={labelWidth} height="20" rx="6" />
                          <text x="0" y="3" textAnchor="middle">{labelText}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              <g className="graph-nodes">
                {viewGraph.nodes.map((node) => {
                  const position = positions[node.id];
                  if (!position) return null;
                  const searchDimmed = query.trim() && !queryMatches.has(node.id);
                  const focusDimmed = focusId && !focusNeighborhood.has(node.id);
                  const isDirectNeighbor = Boolean(focusId && node.id !== focusId && focusNeighborhood.has(node.id));
                  const labelLineHeight = selectedId === node.id ? 16 : isDirectNeighbor ? 15 : 14;
                  const lines = wrappedLabel(node.label, node.shape === "concept" ? 14 : 18);
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${position.x} ${position.y})`}
                      className={`graph-node tone-${node.tone} shape-${node.shape} ${node.status === "future" ? "node-future" : ""} ${selectedId === node.id ? "is-selected" : ""} ${isDirectNeighbor ? "is-neighbor" : ""} ${hoveredId === node.id ? "is-hovered" : ""} ${searchDimmed || focusDimmed ? "is-dimmed" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${node.label}. ${statusLabel(node)}. ${node.category}.${node.is_group ? " Press Enter or double-click to expand this group." : ""}`}
                      aria-keyshortcuts={node.is_group ? "Enter" : undefined}
                      aria-expanded={node.is_group ? false : undefined}
                      onPointerDown={(event) => handleNodePointerDown(event, node)}
                      onMouseEnter={() => setHoveredId(node.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onFocus={() => setHoveredId(node.id)}
                      onBlur={() => setHoveredId(null)}
                      onDoubleClick={() => node.is_group && toggleGroup(node.group!)}
                      onKeyDown={(event) => handleNodeKeyDown(event, node)}
                    >
                      <NodeShape node={node} />
                      <text textAnchor="middle" aria-hidden="true">
                        {lines.map((line, index) => (
                          <tspan
                            x="0"
                            y={(index - (lines.length - 1) / 2) * labelLineHeight}
                            key={`${line}-${index}`}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                      {node.is_group && <text className="group-expand-hint" x="0" y="61" textAnchor="middle">Enter / double-click to expand</text>}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
          {viewGraph.nodes.length === 0 && (
            <div className="graph-empty-state" role="status">
              <strong>No nodes match the current filters.</strong>
              <button type="button" onClick={() => { setCategory("all"); setStatus("all"); }}>Clear filters</button>
            </div>
          )}
        </div>

        <GraphDetailsPanel node={selectedNode} connections={connections} onSelectNode={selectNode} />
      </div>

      <div className="graph-text-fallback">
        <div>
          <p className="kicker">Accessible alternative</p>
          <h2>Text relationship list</h2>
          <p>The lists below contain the same currently visible nodes and labelled relationships as the visual graph.</p>
        </div>
        <details open>
          <summary>{viewGraph.edges.length} visible relationships</summary>
          {viewGraph.edges.length > 0 ? (
            <ol className="graph-relationship-list">
              {viewGraph.edges.map((edge) => {
                const source = viewNodeById.get(edge.source);
                const target = viewNodeById.get(edge.target);
                if (!source || !target) return null;
                return (
                  <li key={`text-${edge.id}`}>
                    <button type="button" onClick={() => selectNode(source)}>{source.label}</button>
                    <span>{edge.label} →</span>
                    <button type="button" onClick={() => selectNode(target)}>{target.label}</button>
                    {edge.aggregate_count && edge.aggregate_count > 1 && <small>Aggregates {edge.aggregate_count} source-backed relationships while groups are collapsed.</small>}
                  </li>
                );
              })}
            </ol>
          ) : <p>No relationship remains under the current filters.</p>}
        </details>
        <details>
          <summary>{viewGraph.nodes.length} visible nodes</summary>
          <ul className="graph-node-directory">
            {viewGraph.nodes.map((node) => (
              <li key={`directory-${node.id}`}>
                <button type="button" onClick={() => selectNode(node)}>{node.label}</button>
                <span>{statusLabel(node)} · {node.category}</span>
                <p>{node.description}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
