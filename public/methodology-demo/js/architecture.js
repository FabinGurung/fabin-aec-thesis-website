(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;
  const NS = "http://www.w3.org/2000/svg";

  function element(name, attributes, text) {
    const node = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value != null) node.setAttribute(key, value);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  function renderPlan(state, runtime) {
    const svg = document.getElementById("architecture-plan");
    svg.replaceChildren();
    const defs = element("defs");
    const arrow = element("marker", {
      id: "arch-dimension-arrow",
      viewBox: "0 0 10 10",
      refX: "5",
      refY: "5",
      markerWidth: "5",
      markerHeight: "5",
      orient: "auto-start-reverse"
    });
    arrow.appendChild(element("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(arrow);
    svg.appendChild(defs);

    const points = Object.values(runtime.points);
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const x = (value) => 120 + ((value - minX) / Math.max(1, maxX - minX)) * 660;
    const y = 196;

    const grid = element("g", { class: "architecture-grid" });
    grid.appendChild(element("line", { x1: 72, y1: y, x2: 828, y2: y }));
    grid.appendChild(element("text", { x: 62, y: y - 12 }, "Viewer grid 1 · y = 0"));
    runtime.elements.forEach((beam) => {
      const gx = x(beam.start.x);
      grid.appendChild(element("line", { x1: gx, y1: 72, x2: gx, y2: 300 }));
    });
    grid.appendChild(
      element("line", {
        x1: x(runtime.points.POINT_C.x),
        y1: 72,
        x2: x(runtime.points.POINT_C.x),
        y2: 300
      })
    );
    svg.appendChild(grid);

    const beamLayer = element("g", { class: "architecture-elements" });
    runtime.elements.forEach((beam) => {
      const selected = beam.id === state.activeElementId;
      const group = element("g", {
        class: `architecture-element${selected ? " selected" : ""}`,
        "data-select-entity": beam.id,
        role: "button",
        tabindex: "0",
        "aria-label": `Select Beam ${beam.label}, ${query.format(beam.length, 2)} metres`
      });
      const line = element("line", {
        x1: x(beam.start.x),
        y1: y,
        x2: x(beam.end.x),
        y2: y
      });
      line.appendChild(
        element(
          "title",
          {},
          `${beam.id}: ${beam.startPointId} → ${beam.endPointId}, ${query.format(
            beam.length,
            2
          )} m`
        )
      );
      const label = element(
        "text",
        {
          x: (x(beam.start.x) + x(beam.end.x)) / 2,
          y: y - 24,
          "text-anchor": "middle"
        },
        `BEAM_${beam.label}`
      );
      const section = element(
        "text",
        {
          x: (x(beam.start.x) + x(beam.end.x)) / 2,
          y: y + 30,
          "text-anchor": "middle",
          class: "architecture-section-label"
        },
        `${query.format(query.value(beam.section.breadth), 2)} × ${query.format(
          query.value(beam.section.depth),
          2
        )} m`
      );
      group.append(line, label, section);
      group.addEventListener("click", () => store.select(beam.id));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          store.select(beam.id);
        }
      });
      beamLayer.appendChild(group);
    });
    svg.appendChild(beamLayer);

    const nodeLayer = element("g", { class: "architecture-nodes" });
    points.forEach((point) => {
      const group = element("g", {
        transform: `translate(${x(point.x)} ${y})`,
        class: "architecture-node"
      });
      group.append(
        element("circle", { r: 11 }),
        element("text", { x: 0, y: 4, "text-anchor": "middle" }, point.label),
        element(
          "text",
          { x: 0, y: -48, "text-anchor": "middle", class: "architecture-coordinate" },
          `${point.id} · (${query.format(point.x, 1)}, ${query.format(
            point.y,
            1
          )}, ${query.format(point.z, 1)})`
        )
      );
      nodeLayer.appendChild(group);
    });
    svg.appendChild(nodeLayer);

    const dimensionLayer = element("g", { class: "architecture-dimensions" });
    runtime.elements.forEach((beam) => {
      const startX = x(beam.start.x);
      const endX = x(beam.end.x);
      const dimY = 330;
      dimensionLayer.append(
        element("line", { x1: startX, y1: y + 16, x2: startX, y2: dimY + 10 }),
        element("line", { x1: endX, y1: y + 16, x2: endX, y2: dimY + 10 }),
        element("line", {
          x1: startX,
          y1: dimY,
          x2: endX,
          y2: dimY,
          "marker-start": "url(#arch-dimension-arrow)",
          "marker-end": "url(#arch-dimension-arrow)"
        }),
        element(
          "text",
          {
            x: (startX + endX) / 2,
            y: dimY - 10,
            "text-anchor": "middle"
          },
          `${query.format(beam.length, 2)} m`
        )
      );
    });
    svg.appendChild(dimensionLayer);

    const note = element("g", { class: "architecture-note" });
    note.append(
      element("rect", { x: 622, y: 20, width: 238, height: 46, rx: 4 }),
      element("text", { x: 638, y: 40 }, "Verified: points + beam spans"),
      element("text", { x: 638, y: 57 }, "Grid name: viewer convention")
    );
    svg.appendChild(note);
  }

  function renderSchedule(state, runtime) {
    document.getElementById("architecture-schedule").innerHTML = runtime.elements
      .map((beam) => {
        const selected = beam.id === state.activeElementId;
        return `
          <tr class="${selected ? "selected-row" : ""}">
            <th scope="row">
              <button type="button" class="table-select" data-select-entity="${beam.id}">
                ${beam.id}
              </button>
            </th>
            <td>${beam.startPointId}</td>
            <td>${beam.endPointId}</td>
            <td>${query.format(beam.length, 2)} m</td>
            <td>${query.format(query.value(beam.section.breadth), 2)} × ${query.format(
              query.value(beam.section.depth),
              2
            )} m</td>
            <td><span class="status-badge ${
              runtime.isSandbox ? "illustrative" : "verified"
            }">${runtime.isSandbox ? "◇ Sandbox" : "✓ Verified"}</span></td>
          </tr>
        `;
      })
      .join("");
  }

  function render(state) {
    const runtime = query.runtime(state);
    renderPlan(state, runtime);
    renderSchedule(state, runtime);
  }

  function init() {
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.architecture = { init };
})();
