(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;
  const NS = "http://www.w3.org/2000/svg";

  const domainConfig = {
    architecture: {
      title: "Architecture",
      subtitle: "Plan geometry + schedule",
      className: "architecture",
      x: 640,
      y: 95
    },
    engineering: {
      title: "Engineering",
      subtitle: "Viewer + MDM + diagrams",
      className: "engineering",
      x: 640,
      y: 235
    },
    construction: {
      title: "Construction",
      subtitle: "Quantity + work delivery",
      className: "construction",
      x: 640,
      y: 375
    }
  };

  const fieldLabels = {
    "element.id": "stable element ID",
    "element.relationships": "semantic relationships",
    "element.status": "provenance status",
    "element.startPointId": "start point",
    "element.endPointId": "end point",
    "point.coordinates": "point coordinates",
    "section.breadth": "breadth b",
    "section.depth": "depth D",
    "viewer.level": "viewer level",
    "element.length": "derived span L",
    "property.EI": "flexural rigidity EI",
    "load.magnitude": "member load w",
    "solve.endConditions": "end conditions",
    elementWorkLinks: "work/document links"
  };

  function svg(name, attributes, text) {
    const node = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value != null) node.setAttribute(key, value);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  function groupedConsumers() {
    const groups = {};
    model.viewConsumers
      .filter((view) => ["architecture", "engineering", "construction"].includes(view.domain))
      .forEach((view) => {
        groups[view.domain] = groups[view.domain] || [];
        groups[view.domain].push(view);
      });
    return groups;
  }

  function uniqueFields(views) {
    return [...new Set((views || []).flatMap((view) => view.consumes))];
  }

  function renderGraphic(state, runtime) {
    const canvas = document.getElementById("lineage-graphic");
    canvas.replaceChildren();
    const active = runtime.elements.find((item) => item.id === state.activeElementId);
    const quantity = runtime.quantities.find((item) => item.elementId === active.id);
    const groups = groupedConsumers();

    const defs = svg("defs");
    const marker = svg("marker", {
      id: "lineage-arrow",
      viewBox: "0 0 10 10",
      refX: "9",
      refY: "5",
      markerWidth: "7",
      markerHeight: "7",
      orient: "auto"
    });
    marker.appendChild(svg("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
    canvas.appendChild(defs);

    const central = svg("g", { class: "lineage-central" });
    central.append(
      svg("rect", { x: 62, y: 156, width: 285, height: 208, rx: 8 }),
      svg("text", { x: 88, y: 190, class: "lineage-kicker" }, "CANONICAL ENTITY"),
      svg("text", { x: 88, y: 225, class: "lineage-title" }, active.id),
      svg(
        "text",
        { x: 88, y: 255, class: "lineage-detail" },
        `${active.startPointId} → ${active.endPointId}`
      ),
      svg(
        "text",
        { x: 88, y: 282, class: "lineage-detail" },
        `L = ${query.format(active.length, 2)} m`
      ),
      svg(
        "text",
        { x: 88, y: 309, class: "lineage-detail" },
        `b × D = ${query.format(query.value(active.section.breadth), 2)} × ${query.format(
          query.value(active.section.depth),
          2
        )} m`
      ),
      svg(
        "text",
        { x: 88, y: 336, class: "lineage-detail" },
        `Concrete = ${query.format(quantity.value, 3)} m³`
      )
    );
    canvas.appendChild(central);

    Object.entries(domainConfig).forEach(([domain, config], index) => {
      const fields = uniqueFields(groups[domain]);
      const centerY = config.y + 54;
      const path = svg("path", {
        d: `M 347 260 C 455 260, 492 ${centerY}, ${config.x} ${centerY}`,
        class: `lineage-path ${config.className}`,
        "marker-end": "url(#lineage-arrow)"
      });
      canvas.appendChild(path);

      const fieldLabel = fields
        .map((field) => fieldLabels[field] || field)
        .slice(0, 4)
        .join(" · ");
      const edgeText = svg(
        "text",
        {
          x: 474,
          y: 200 + index * 82,
          class: "lineage-edge-label",
          "text-anchor": "middle"
        },
        fieldLabel
      );
      canvas.appendChild(edgeText);

      const domainGroup = svg("g", {
        class: `lineage-domain ${config.className}`
      });
      domainGroup.append(
        svg("rect", { x: config.x, y: config.y, width: 215, height: 108, rx: 7 }),
        svg("text", { x: config.x + 20, y: config.y + 34, class: "lineage-domain-title" }, config.title),
        svg("text", { x: config.x + 20, y: config.y + 60, class: "lineage-domain-sub" }, config.subtitle),
        svg(
          "text",
          { x: config.x + 20, y: config.y + 84, class: "lineage-domain-count" },
          `${fields.length} shared field references`
        )
      );
      canvas.appendChild(domainGroup);
    });

    const status = svg("g", { class: "lineage-status" });
    status.append(
      svg("rect", { x: 62, y: 398, width: 285, height: 58, rx: 6 }),
      svg(
        "text",
        { x: 82, y: 423 },
        runtime.isSandbox
          ? "◇ Demonstration copy active"
          : "✓ Verified baseline active"
      ),
      svg(
        "text",
        { x: 82, y: 444, class: "lineage-status-sub" },
        "All visible values originate from one runtime entity."
      )
    );
    canvas.appendChild(status);
  }

  function outputFor(view) {
    const outputs = {
      VIEW_GRAPH: "Graph node, inspector and relationships",
      VIEW_ARCH_PLAN: "Line/nodal plan and element schedule",
      VIEW_STRUCTURAL_MODEL: "Plan, elevation and isometric geometry",
      VIEW_ENGINEERING: "MDM trace, moments, reactions and diagrams",
      VIEW_CONSTRUCTION: "Concrete quantity and delivery links"
    };
    return outputs[view.id] || "Generated view";
  }

  function renderTable(state) {
    const elementLabel = state.activeElementId === "BEAM_AB" ? "Beam AB" : "Beam BC";
    document.getElementById(
      "lineage-table-title"
    ).textContent = `${elementLabel} reuse map`;
    document.getElementById("lineage-table").innerHTML = model.viewConsumers
      .map(
        (view) => `
          <tr>
            <th scope="row">${view.name}</th>
            <td>
              <ul class="field-token-list">
                ${view.consumes
                  .map(
                    (field) =>
                      `<li><code>${fieldLabels[field] || field}</code></li>`
                  )
                  .join("")}
              </ul>
            </td>
            <td>${outputFor(view)}</td>
          </tr>
        `
      )
      .join("");
  }

  function render(state) {
    const runtime = query.runtime(state);
    renderGraphic(state, runtime);
    renderTable(state);
  }

  function init() {
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.lineage = { init };
})();
