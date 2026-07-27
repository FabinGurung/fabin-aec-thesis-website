(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;
  const NS = "http://www.w3.org/2000/svg";
  const nodeMap = new Map(model.graphNodes.map((node) => [node.id, node]));
  const positions = new Map();
  let visibleNodes = [];
  let visibleEdges = [];
  let currentViewBox = { x: 0, y: 0, width: 1000, height: 620 };
  let draggingNode = null;
  let panning = null;
  let suppressClick = false;

  const filterGroups = [
    { id: "all", label: "All", match: () => true },
    {
      id: "geometry",
      label: "Geometry",
      match: (category) => ["geometry", "element", "property"].includes(category)
    },
    {
      id: "architecture",
      label: "Architecture",
      match: (category) => category === "architecture"
    },
    {
      id: "engineering",
      label: "Engineering",
      match: (category) =>
        ["engineering", "load", "analysis"].includes(category)
    },
    {
      id: "construction",
      label: "Construction",
      match: (category) =>
        ["construction", "quantity", "work"].includes(category)
    },
    {
      id: "document",
      label: "Documents",
      match: (category) => category === "document"
    }
  ];

  function svgElement(name, attributes) {
    const element = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value != null) element.setAttribute(key, value);
    });
    return element;
  }

  function adjacency() {
    const map = new Map(model.graphNodes.map((node) => [node.id, new Set()]));
    model.relationships.forEach((edge) => {
      map.get(edge.source)?.add(edge.target);
      map.get(edge.target)?.add(edge.source);
    });
    return map;
  }

  function localNodeIds(selectedId, depth) {
    const links = adjacency();
    const start = links.has(selectedId) ? selectedId : "HUB_SHARED_ELEMENT";
    const distance = new Map([[start, 0]]);
    const queue = [start];
    while (queue.length) {
      const id = queue.shift();
      const current = distance.get(id);
      if (current >= depth) continue;
      links.get(id)?.forEach((neighbor) => {
        if (distance.has(neighbor)) return;
        distance.set(neighbor, current + 1);
        queue.push(neighbor);
      });
    }
    return distance;
  }

  function categoryAllowed(node, filterId) {
    if (filterId === "all") return true;
    if (["core", "hub", "element"].includes(node.category)) return true;
    const group = filterGroups.find((item) => item.id === filterId);
    return group ? group.match(node.category) : true;
  }

  function graphSubset(state) {
    const graphState = state.graph;
    let nodes;
    let distanceMap = null;

    if (graphState.mode === "global") {
      nodes = model.graphNodes.filter((node) => node.globalLayer != null);
    } else {
      distanceMap = localNodeIds(state.selectedEntityId, Number(graphState.depth));
      nodes = model.graphNodes.filter((node) => distanceMap.has(node.id));
    }

    nodes = nodes.filter((node) => categoryAllowed(node, graphState.category));
    if (!nodes.some((node) => node.id === state.selectedEntityId)) {
      const selected = nodeMap.get(state.selectedEntityId);
      if (selected) nodes.push(selected);
    }

    const ids = new Set(nodes.map((node) => node.id));
    const edges = model.relationships.filter(
      (edge) =>
        ids.has(edge.source) &&
        ids.has(edge.target) &&
        (graphState.mode === "local" || edge.global)
    );
    return { nodes, edges, distanceMap };
  }

  function globalLayout(nodes) {
    const layers = new Map();
    nodes.forEach((node) => {
      const layer = Number(node.globalLayer || 0);
      if (!layers.has(layer)) layers.set(layer, []);
      layers.get(layer).push(node);
    });
    const maxLayer = Math.max(...layers.keys(), 1);
    [...layers.entries()].forEach(([layer, items]) => {
      items.sort((a, b) => a.label.localeCompare(b.label));
      const x = 95 + (layer / maxLayer) * 810;
      items.forEach((node, index) => {
        const y =
          items.length === 1
            ? 310
            : 92 + (index / Math.max(1, items.length - 1)) * 436;
        positions.set(node.id, { x, y });
      });
    });
  }

  function localLayout(nodes, distanceMap, selectedId) {
    const rings = new Map();
    nodes.forEach((node) => {
      const distance = distanceMap?.get(node.id) ?? (node.id === selectedId ? 0 : 1);
      if (!rings.has(distance)) rings.set(distance, []);
      rings.get(distance).push(node);
    });

    positions.set(selectedId, { x: 500, y: 310 });
    [...rings.entries()].forEach(([distance, items]) => {
      if (distance === 0) return;
      items.sort((a, b) => a.label.localeCompare(b.label));
      const radiusX = 150 + (distance - 1) * 170;
      const radiusY = 115 + (distance - 1) * 105;
      items.forEach((node, index) => {
        const angle =
          -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, items.length);
        positions.set(node.id, {
          x: 500 + Math.cos(angle) * radiusX,
          y: 310 + Math.sin(angle) * radiusY
        });
      });
    });

    for (let iteration = 0; iteration < 28; iteration += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          if (a.id === selectedId || b.id === selectedId) continue;
          const pa = positions.get(a.id);
          const pb = positions.get(b.id);
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const minDistance = 158;
          if (distance >= minDistance) continue;
          const push = (minDistance - distance) / 2;
          const ux = dx / distance;
          const uy = dy / distance;
          pa.x -= ux * push;
          pa.y -= uy * push;
          pb.x += ux * push;
          pb.y += uy * push;
        }
      }
    }
  }

  function dynamicSublabel(node, runtime) {
    const point = runtime.points[node.id];
    if (point) {
      return `(${query.format(point.x, 1)}, ${query.format(point.y, 1)}, ${query.format(
        point.z,
        1
      )})`;
    }
    const element = runtime.elements.find((item) => item.id === node.id);
    if (element) return `${query.format(element.length, 2)} m · verified entity`;
    if (node.id === "SECTION_BEAM_230_450") {
      const section = model.sections[0];
      return `${query.format(query.value(section.breadth), 2)} × ${query.format(
        query.value(section.depth),
        2
      )} m`;
    }
    if (node.id === "PROPERTY_EI_AB" || node.id === "PROPERTY_EI_BC") {
      const elementId = node.id.endsWith("_AB") ? "BEAM_AB" : "BEAM_BC";
      return `${query.format(runtime.analysis.results[elementId].ei, 0)} kN·m²`;
    }
    if (node.id === "LOAD_AB_UDL" || node.id === "LOAD_BC_ZERO") {
      const elementId = node.id.includes("_AB_") ? "BEAM_AB" : "BEAM_BC";
      return `${query.format(runtime.analysis.results[elementId].udl, 2)} kN/m`;
    }
    if (node.id === "QTY_CONCRETE_AB" || node.id === "QTY_CONCRETE_BC") {
      const elementId = node.id.endsWith("_AB") ? "BEAM_AB" : "BEAM_BC";
      const quantity = runtime.quantities.find((item) => item.elementId === elementId);
      return `${query.format(quantity.value, 3)} m³`;
    }
    if (node.id === "RESULT_AB" || node.id === "RESULT_BC") {
      const elementId = node.id.endsWith("_AB") ? "BEAM_AB" : "BEAM_BC";
      const result = runtime.analysis.results[elementId];
      return `${query.formatSigned(result.nearMoment, 1)} / ${query.formatSigned(
        result.farMoment,
        1
      )} kN·m`;
    }
    if (node.id === "VIEW_CONSTRUCTION") {
      return `${model.elementWorkLinks.length} verified links`;
    }
    if (node.id === "SOLVE_MDM_001") {
      return `Steps ${model.solveCases[0].sourceStepOrders.join(" · ")}`;
    }
    return node.sublabel || "";
  }

  function nodeDimensions(node) {
    if (node.id === "HUB_SHARED_ELEMENT") return { width: 184, height: 68 };
    if (node.category === "element") return { width: 160, height: 62 };
    return { width: 146, height: 54 };
  }

  function connectionPath(source, target, index) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / length;
    const normalY = dx / length;
    const curve = ((index % 5) - 2) * 9;
    const c1x = source.x + dx * 0.35 + normalX * curve;
    const c1y = source.y + dy * 0.35 + normalY * curve;
    const c2x = source.x + dx * 0.65 + normalX * curve;
    const c2y = source.y + dy * 0.65 + normalY * curve;
    return {
      d: `M ${source.x} ${source.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${target.x} ${target.y}`,
      labelX: source.x + dx * 0.5 + normalX * (curve + 12),
      labelY: source.y + dy * 0.5 + normalY * (curve + 12)
    };
  }

  function createDefs(svg) {
    if (svg.querySelector("#graph-arrow")) return;
    const defs = svgElement("defs");
    const marker = svgElement("marker", {
      id: "graph-arrow",
      viewBox: "0 0 10 10",
      refX: "9",
      refY: "5",
      markerWidth: "7",
      markerHeight: "7",
      orient: "auto-start-reverse"
    });
    marker.appendChild(
      svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "graph-arrow-head" })
    );
    defs.appendChild(marker);
    svg.insertBefore(defs, svg.firstChild);
  }

  function renderEdges(state) {
    const layer = document.getElementById("graph-edges");
    layer.replaceChildren();
    visibleEdges.forEach((edge, index) => {
      const sourcePosition = positions.get(edge.source);
      const targetPosition = positions.get(edge.target);
      if (!sourcePosition || !targetPosition) return;
      const geometry = connectionPath(sourcePosition, targetPosition, index);
      const emphasized =
        edge.source === state.selectedEntityId || edge.target === state.selectedEntityId;
      const connectedToActive =
        [edge.source, edge.target].includes(state.activeElementId);
      const group = svgElement("g", {
        class: `graph-edge${emphasized ? " emphasized" : ""}${
          connectedToActive ? " active-element-edge" : ""
        }${state.selectedEntityId && !emphasized ? " dimmed" : ""}`,
        "data-edge-id": edge.id
      });
      const path = svgElement("path", {
        d: geometry.d,
        class: "graph-edge-path",
        "marker-end": "url(#graph-arrow)"
      });
      const label = svgElement("text", {
        x: geometry.labelX,
        y: geometry.labelY,
        class: "graph-edge-label",
        "text-anchor": "middle",
        "aria-hidden": "true"
      });
      label.textContent = edge.type;
      group.append(path, label);
      layer.appendChild(group);
    });
  }

  function focusSiblingNode(currentId, direction) {
    const ids = visibleNodes.map((node) => node.id);
    const index = ids.indexOf(currentId);
    if (index < 0) return;
    const nextIndex =
      direction > 0
        ? (index + 1) % ids.length
        : (index - 1 + ids.length) % ids.length;
    document
      .querySelector(`.graph-node[data-node-id="${ids[nextIndex]}"]`)
      ?.focus();
  }

  function renderNodes(state, runtime) {
    const layer = document.getElementById("graph-nodes");
    layer.replaceChildren();
    const neighborIds = new Set();
    visibleEdges.forEach((edge) => {
      if (edge.source === state.selectedEntityId) neighborIds.add(edge.target);
      if (edge.target === state.selectedEntityId) neighborIds.add(edge.source);
    });

    visibleNodes.forEach((node) => {
      const position = positions.get(node.id);
      const dimensions = nodeDimensions(node);
      const selected = node.id === state.selectedEntityId;
      const activeElement =
        node.id === state.activeElementId || node.elementId === state.activeElementId;
      const related = selected || neighborIds.has(node.id);
      const group = svgElement("g", {
        class: `graph-node category-${node.category}${selected ? " selected" : ""}${
          activeElement ? " active-element" : ""
        }${state.selectedEntityId && !related ? " dimmed" : ""}`,
        transform: `translate(${position.x} ${position.y})`,
        tabindex: "0",
        role: "button",
        "data-node-id": node.id,
        "aria-pressed": String(selected),
        "aria-label": `${node.label}. ${dynamicSublabel(node, runtime)}. Select for relationships.`
      });
      const rect = svgElement("rect", {
        x: -dimensions.width / 2,
        y: -dimensions.height / 2,
        width: dimensions.width,
        height: dimensions.height,
        rx: node.id === "HUB_SHARED_ELEMENT" ? 12 : 7,
        class: "graph-node-shape"
      });
      const title = svgElement("text", {
        x: 0,
        y: -3,
        "text-anchor": "middle",
        class: "graph-node-title"
      });
      title.textContent = node.label;
      const sub = svgElement("text", {
        x: 0,
        y: 16,
        "text-anchor": "middle",
        class: "graph-node-subtitle"
      });
      sub.textContent = dynamicSublabel(node, runtime);
      group.append(rect, title, sub);

      let start = null;
      group.addEventListener("pointerdown", (event) => {
        draggingNode = node.id;
        start = {
          clientX: event.clientX,
          clientY: event.clientY,
          x: position.x,
          y: position.y
        };
        suppressClick = false;
        group.setPointerCapture(event.pointerId);
        event.stopPropagation();
      });
      group.addEventListener("pointermove", (event) => {
        if (draggingNode !== node.id || !start) return;
        const svg = document.getElementById("methodology-graph");
        const rectBox = svg.getBoundingClientRect();
        const scaleX = currentViewBox.width / Math.max(1, rectBox.width);
        const scaleY = currentViewBox.height / Math.max(1, rectBox.height);
        const dx = (event.clientX - start.clientX) * scaleX;
        const dy = (event.clientY - start.clientY) * scaleY;
        if (Math.hypot(dx, dy) > 3) suppressClick = true;
        position.x = start.x + dx;
        position.y = start.y + dy;
        group.setAttribute("transform", `translate(${position.x} ${position.y})`);
        renderEdges(state);
      });
      group.addEventListener("pointerup", (event) => {
        if (group.hasPointerCapture(event.pointerId)) {
          group.releasePointerCapture(event.pointerId);
        }
        draggingNode = null;
        start = null;
      });
      group.addEventListener("click", () => {
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        store.select(node.id);
      });
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          store.select(node.id);
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          focusSiblingNode(node.id, 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          focusSiblingNode(node.id, -1);
        }
      });
      layer.appendChild(group);
    });
  }

  function fitGraph() {
    if (!visibleNodes.length) return;
    const extents = visibleNodes.map((node) => {
      const position = positions.get(node.id);
      const dimensions = nodeDimensions(node);
      return {
        minX: position.x - dimensions.width / 2,
        maxX: position.x + dimensions.width / 2,
        minY: position.y - dimensions.height / 2,
        maxY: position.y + dimensions.height / 2
      };
    });
    const minX = Math.min(...extents.map((item) => item.minX));
    const maxX = Math.max(...extents.map((item) => item.maxX));
    const minY = Math.min(...extents.map((item) => item.minY));
    const maxY = Math.max(...extents.map((item) => item.maxY));
    const padding = 72;
    setViewBox({
      x: minX - padding,
      y: minY - padding,
      width: Math.max(480, maxX - minX + padding * 2),
      height: Math.max(320, maxY - minY + padding * 2)
    });
  }

  function setViewBox(box) {
    currentViewBox = box;
    document
      .getElementById("methodology-graph")
      .setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
  }

  function zoom(factor) {
    const centerX = currentViewBox.x + currentViewBox.width / 2;
    const centerY = currentViewBox.y + currentViewBox.height / 2;
    const width = Math.max(360, Math.min(1800, currentViewBox.width * factor));
    const height = Math.max(240, Math.min(1150, currentViewBox.height * factor));
    setViewBox({
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height
    });
  }

  function renderInspector(state, runtime) {
    const node = nodeMap.get(state.selectedEntityId) || nodeMap.get("HUB_SHARED_ELEMENT");
    const relations = model.relationships.filter(
      (edge) => edge.source === node.id || edge.target === node.id
    );
    document.getElementById("graph-inspector-title").textContent = node.label;
    document.getElementById("graph-inspector-description").textContent =
      node.description;
    document.getElementById("graph-inspector-meta").innerHTML = `
      <div><dt>Canonical ID</dt><dd><code>${node.id}</code></dd></div>
      <div><dt>Category</dt><dd>${node.category}</dd></div>
      <div><dt>Current value</dt><dd>${dynamicSublabel(node, runtime) || "Relationship entity"}</dd></div>
      <div><dt>Direct links</dt><dd>${relations.length}</dd></div>
    `;
    document.getElementById("graph-inspector-relations").innerHTML = relations
      .map((edge) => {
        const outgoing = edge.source === node.id;
        const otherId = outgoing ? edge.target : edge.source;
        return `
          <button type="button" class="relation-row" data-select-entity="${otherId}">
            <span>${outgoing ? "→" : "←"} ${query.nodeLabel(otherId)}</span>
            <small>${edge.type}</small>
          </button>
        `;
      })
      .join("");
    const open = document.getElementById("graph-open-section");
    open.hidden = !node.target;
    open.onclick = node.target
      ? () =>
          document
            .getElementById(node.target)
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
      : null;
  }

  function renderFallback() {
    const list = document.getElementById("graph-relationship-fallback");
    list.innerHTML = visibleEdges
      .map(
        (edge) =>
          `<li><strong>${query.nodeLabel(edge.source)}</strong> ${
            edge.type
          } <strong>${query.nodeLabel(edge.target)}</strong></li>`
      )
      .join("");
  }

  function syncControls(state) {
    const local = state.graph.mode === "local";
    document.getElementById("graph-global").setAttribute("aria-pressed", String(!local));
    document.getElementById("graph-local").setAttribute("aria-pressed", String(local));
    document.getElementById("graph-depth").disabled = !local;
    document.getElementById("graph-depth").value = String(state.graph.depth);
    document.getElementById("graph-search").value = state.graph.search || "";
    document.querySelectorAll("[data-graph-filter]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.graphFilter === state.graph.category)
      );
    });
  }

  function render(state, shouldFit) {
    const runtime = query.runtime(state);
    const subset = graphSubset(state);
    visibleNodes = subset.nodes;
    visibleEdges = subset.edges;
    positions.clear();
    if (state.graph.mode === "global") globalLayout(visibleNodes);
    else localLayout(visibleNodes, subset.distanceMap, state.selectedEntityId);
    renderEdges(state);
    renderNodes(state, runtime);
    renderInspector(state, runtime);
    renderFallback();
    syncControls(state);
    if (shouldFit !== false) fitGraph();
  }

  function initializeFilters() {
    const container = document.getElementById("graph-filters");
    container.innerHTML = filterGroups
      .map(
        (group) =>
          `<button type="button" data-graph-filter="${group.id}" aria-pressed="${
            group.id === "all"
          }">${group.label}</button>`
      )
      .join("");
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-graph-filter]");
      if (!button) return;
      store.set({ graph: { category: button.dataset.graphFilter } });
    });
  }

  function initializeSearch() {
    const input = document.getElementById("graph-search");
    document.getElementById("graph-search-options").innerHTML = model.graphNodes
      .map((node) => `<option value="${node.id}">${node.label}</option>`)
      .join("");
    const search = () => {
      const raw = input.value.trim().toLowerCase();
      if (!raw) {
        store.set({ graph: { search: "" } });
        return;
      }
      const match = model.graphNodes.find(
        (node) =>
          node.id.toLowerCase() === raw ||
          node.id.toLowerCase().includes(raw) ||
          node.label.toLowerCase().includes(raw)
      );
      if (!match) {
        input.setCustomValidity("No matching entity. Try Beam AB, Point B or MDM.");
        input.reportValidity();
        return;
      }
      input.setCustomValidity("");
      store.set({ graph: { mode: "local", search: input.value } });
      store.select(match.id);
    };
    input.addEventListener("change", search);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        search();
      }
    });
  }

  function initializeCamera() {
    const svg = document.getElementById("methodology-graph");
    createDefs(svg);
    document.getElementById("graph-zoom-in").addEventListener("click", () => zoom(0.82));
    document.getElementById("graph-zoom-out").addEventListener("click", () => zoom(1.22));
    document.getElementById("graph-fit").addEventListener("click", fitGraph);
    document.getElementById("graph-reset").addEventListener("click", () => {
      const active = store.get().activeElementId;
      store.set({
        selectedEntityId: active,
        graph: { mode: "global", depth: 2, category: "all", search: "" }
      });
      // Node dragging and canvas panning are intentionally local camera state.
      // Force a fresh data layout even when the application state was already
      // at its defaults, so Reset always restores both nodes and viewBox.
      render(store.get(), true);
    });

    svg.addEventListener("wheel", (event) => {
      event.preventDefault();
      zoom(event.deltaY < 0 ? 0.9 : 1.1);
    }, { passive: false });

    svg.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".graph-node")) return;
      panning = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        viewBox: { ...currentViewBox }
      };
      svg.setPointerCapture(event.pointerId);
    });
    svg.addEventListener("pointermove", (event) => {
      if (!panning || event.pointerId !== panning.pointerId) return;
      const rect = svg.getBoundingClientRect();
      const dx =
        ((event.clientX - panning.clientX) / Math.max(1, rect.width)) *
        panning.viewBox.width;
      const dy =
        ((event.clientY - panning.clientY) / Math.max(1, rect.height)) *
        panning.viewBox.height;
      setViewBox({
        ...panning.viewBox,
        x: panning.viewBox.x - dx,
        y: panning.viewBox.y - dy
      });
    });
    const stopPan = (event) => {
      if (!panning || event.pointerId !== panning.pointerId) return;
      if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
      panning = null;
    };
    svg.addEventListener("pointerup", stopPan);
    svg.addEventListener("pointercancel", stopPan);
  }

  function init() {
    initializeFilters();
    initializeSearch();
    initializeCamera();
    document.getElementById("graph-global").addEventListener("click", () => {
      store.set({ graph: { mode: "global" } });
    });
    document.getElementById("graph-local").addEventListener("click", () => {
      store.set({ graph: { mode: "local" } });
    });
    document.getElementById("graph-depth").addEventListener("change", (event) => {
      store.set({ graph: { depth: Number(event.target.value), mode: "local" } });
    });

    let previousKey = "";
    store.subscribe((state) => {
      const key = JSON.stringify({
        selected: state.selectedEntityId,
        active: state.activeElementId,
        graph: state.graph,
        sandbox: state.sandbox
      });
      if (key === previousKey) return;
      previousKey = key;
      render(state, true);
    });
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.graph = { init, fit: fitGraph };
})();
