(function () {
  "use strict";

  const AEC = window.AEC;
  const { query, store } = AEC;
  const NS = "http://www.w3.org/2000/svg";
  const bayDepth = 4;
  let pointerSession = null;

  const layerDefinitions = [
    ["grid", "Grid"],
    ["joints", "Joints"],
    ["beams", "Beams"],
    ["columns", "Columns"],
    ["slabs", "Slab"],
    ["labels", "Labels"],
    ["dimensions", "Dimensions"],
    ["verifiedOnly", "Verified only"]
  ];

  function svg(name, attributes, text) {
    const node = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value != null) node.setAttribute(key, value);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  function cameraTransform(viewer) {
    return `translate(${viewer.panX} ${viewer.panY}) translate(480 300) scale(${viewer.zoom}) translate(-480 -300)`;
  }

  function extent(runtime) {
    const xs = Object.values(runtime.points).map((point) => point.x);
    return { minX: Math.min(...xs), maxX: Math.max(...xs) };
  }

  function addTitle(group, text, subtitle) {
    const tag = svg("g", { class: "viewer-title-tag" });
    tag.append(
      svg("rect", { x: 46, y: 30, width: 330, height: 52, rx: 6 }),
      svg("text", { x: 62, y: 52 }, text),
      svg("text", { x: 62, y: 69, class: "viewer-title-sub" }, subtitle)
    );
    group.appendChild(tag);
  }

  function addAxes(group, origin, axes) {
    const triad = svg("g", {
      class: "viewer-axis-triad",
      transform: `translate(${origin.x} ${origin.y})`
    });
    triad.appendChild(svg("circle", { cx: 0, cy: 0, r: 4 }));
    axes.forEach((axis) => {
      triad.append(
        svg("line", {
          x1: 0,
          y1: 0,
          x2: axis.x,
          y2: axis.y,
          class: `axis-${axis.label.toLowerCase()}`
        }),
        svg(
          "text",
          {
            x: axis.x + (axis.x >= 0 ? 8 : -12),
            y: axis.y + (axis.y >= 0 ? 14 : -8)
          },
          axis.label
        )
      );
    });
    group.appendChild(triad);
  }

  function beamGroup(beam, coords, selected, labels) {
    const group = svg("g", {
      class: `viewer-beam verified${selected ? " selected" : ""}`,
      "data-select-entity": beam.id,
      role: "button",
      tabindex: "0",
      "aria-label": `Select Beam ${beam.label}, verified span ${query.format(
        beam.length,
        2
      )} metres`
    });
    const line = svg("line", coords);
    line.appendChild(
      svg(
        "title",
        {},
        `${beam.id}: ${beam.startPointId} → ${beam.endPointId}, ${query.format(
          beam.length,
          2
        )} m`
      )
    );
    group.appendChild(line);
    if (labels) {
      group.appendChild(
        svg(
          "text",
          {
            x: (Number(coords.x1) + Number(coords.x2)) / 2,
            y: (Number(coords.y1) + Number(coords.y2)) / 2 - 14,
            "text-anchor": "middle",
            class: "viewer-member-label"
          },
          `${beam.id} · ${query.format(beam.length, 2)} m`
        )
      );
    }
    return group;
  }

  function addDimensionsPlan(group, runtime, xMap, y, enabled) {
    if (!enabled) return;
    const dimensions = svg("g", { class: "viewer-dimensions" });
    runtime.elements.forEach((beam) => {
      const x1 = xMap(beam.start.x);
      const x2 = xMap(beam.end.x);
      const dy = y + 154;
      dimensions.append(
        svg("line", { x1, y1: y + 20, x2: x1, y2: dy + 8 }),
        svg("line", { x1: x2, y1: y + 20, x2, y2: dy + 8 }),
        svg("line", { x1, y1: dy, x2, y2: dy }),
        svg("line", { x1, y1: dy - 9, x2: x1, y2: dy + 9 }),
        svg("line", { x1: x2, y1: dy - 9, x2, y2: dy + 9 }),
        svg(
          "text",
          { x: (x1 + x2) / 2, y: dy - 10, "text-anchor": "middle" },
          `${query.format(beam.length, 2)} m`
        )
      );
    });
    group.appendChild(dimensions);
  }

  function renderPlan(group, state, runtime) {
    const layers = state.viewer.layers;
    const range = extent(runtime);
    const xMap = (x) =>
      150 + ((x - range.minX) / Math.max(1, range.maxX - range.minX)) * 620;
    const yMap = (y) => 210 + (y / bayDepth) * 200;
    const verifiedOnly = layers.verifiedOnly;
    const z = verifiedOnly ? 0 : runtime.levelHeight;
    addTitle(
      group,
      "PLAN · X–Y PROJECTION",
      verifiedOnly
        ? "Verified analytical line plane · Z = 0.00 m"
        : `Illustrative viewer placement · Z = ${query.format(z, 2)} m`
    );

    if (layers.grid && !verifiedOnly) {
      const grid = svg("g", { class: "viewer-grid" });
      [runtime.points.POINT_A.x, runtime.points.POINT_B.x, runtime.points.POINT_C.x].forEach(
        (x, index) => {
          grid.append(
            svg("line", { x1: xMap(x), y1: 120, x2: xMap(x), y2: 455 }),
            svg("circle", { cx: xMap(x), cy: 105, r: 18 }),
            svg("text", { x: xMap(x), y: 111, "text-anchor": "middle" }, ["A", "B", "C"][index])
          );
        }
      );
      [0, bayDepth].forEach((y, index) => {
        grid.append(
          svg("line", { x1: 105, y1: yMap(y), x2: 815, y2: yMap(y) }),
          svg("circle", { cx: 840, cy: yMap(y), r: 18 }),
          svg("text", { x: 840, y: yMap(y) + 6, "text-anchor": "middle" }, String(index + 1))
        );
      });
      group.appendChild(grid);
    }

    if (layers.slabs && !verifiedOnly) {
      const slab = svg("g", { class: "viewer-slab" });
      slab.append(
        svg("rect", {
          x: xMap(range.minX),
          y: yMap(0),
          width: xMap(range.maxX) - xMap(range.minX),
          height: yMap(bayDepth) - yMap(0),
          rx: 3
        }),
        svg(
          "text",
          {
            x: (xMap(range.minX) + xMap(range.maxX)) / 2,
            y: (yMap(0) + yMap(bayDepth)) / 2 + 5,
            "text-anchor": "middle"
          },
          "ILLUSTRATIVE SLAB"
        )
      );
      group.appendChild(slab);
    }

    if (layers.beams) {
      const beams = svg("g", { class: "viewer-beams" });
      runtime.elements.forEach((beam) => {
        beams.appendChild(
          beamGroup(
            beam,
            {
              x1: xMap(beam.start.x),
              y1: yMap(0),
              x2: xMap(beam.end.x),
              y2: yMap(0)
            },
            beam.id === state.activeElementId,
            layers.labels
          )
        );
      });
      if (!verifiedOnly) {
        runtime.elements.forEach((beam) => {
          beams.appendChild(
            svg("line", {
              x1: xMap(beam.start.x),
              y1: yMap(bayDepth),
              x2: xMap(beam.end.x),
              y2: yMap(bayDepth),
              class: "viewer-beam illustrative"
            })
          );
        });
        [runtime.points.POINT_A.x, runtime.points.POINT_B.x, runtime.points.POINT_C.x].forEach(
          (x) =>
            beams.appendChild(
              svg("line", {
                x1: xMap(x),
                y1: yMap(0),
                x2: xMap(x),
                y2: yMap(bayDepth),
                class: "viewer-beam illustrative"
              })
            )
        );
      }
      group.appendChild(beams);
    }

    if (layers.joints) {
      const joints = svg("g", { class: "viewer-joints" });
      Object.values(runtime.points).forEach((point) => {
        joints.append(
          svg("circle", { cx: xMap(point.x), cy: yMap(0), r: 7, class: "verified" }),
          layers.labels
            ? svg(
                "text",
                { x: xMap(point.x), y: yMap(0) + 30, "text-anchor": "middle" },
                point.id
              )
            : document.createDocumentFragment()
        );
      });
      if (!verifiedOnly && layers.columns) {
        [runtime.points.POINT_A.x, runtime.points.POINT_B.x, runtime.points.POINT_C.x].forEach(
          (x) => {
            joints.appendChild(
              svg("rect", {
                x: xMap(x) - 8,
                y: yMap(bayDepth) - 8,
                width: 16,
                height: 16,
                class: "illustrative"
              })
            );
          }
        );
      }
      group.appendChild(joints);
    }

    addDimensionsPlan(group, runtime, xMap, yMap(0), layers.dimensions);
    addAxes(group, { x: 92, y: 520 }, [
      { label: "X", x: 52, y: 0 },
      { label: "Y", x: 0, y: -52 }
    ]);
  }

  function renderElevation(group, state, runtime) {
    const layers = state.viewer.layers;
    const verifiedOnly = layers.verifiedOnly;
    const zTop = verifiedOnly ? 0 : runtime.levelHeight;
    const range = extent(runtime);
    const xMap = (x) =>
      160 + ((x - range.minX) / Math.max(1, range.maxX - range.minX)) * 590;
    const zMap = (z) => (verifiedOnly ? 310 : 480 - (z / Math.max(1, zTop)) * 270);
    addTitle(
      group,
      "ELEVATION · X–Z · VIEWER GRID 1",
      verifiedOnly
        ? "Verified analytical line at source coordinate Z = 0.00 m"
        : `Verified spans at illustrative elevation Z = ${query.format(zTop, 2)} m`
    );

    if (layers.grid && !verifiedOnly) {
      const grid = svg("g", { class: "viewer-grid" });
      grid.append(
        svg("line", { x1: 105, y1: zMap(0), x2: 815, y2: zMap(0) }),
        svg("line", { x1: 105, y1: zMap(zTop), x2: 815, y2: zMap(zTop) }),
        svg("text", { x: 46, y: zMap(0) + 5 }, "Z = 0.00 m"),
        svg(
          "text",
          { x: 46, y: zMap(zTop) + 5 },
          `Z = ${query.format(zTop, 2)} m`
        )
      );
      Object.values(runtime.points).forEach((point) => {
        grid.append(
          svg("line", {
            x1: xMap(point.x),
            y1: 120,
            x2: xMap(point.x),
            y2: 515
          }),
          svg("circle", { cx: xMap(point.x), cy: 105, r: 18 }),
          svg("text", { x: xMap(point.x), y: 111, "text-anchor": "middle" }, point.label)
        );
      });
      group.appendChild(grid);
    }

    if (layers.columns && !verifiedOnly) {
      const columns = svg("g", { class: "viewer-columns" });
      Object.values(runtime.points).forEach((point) => {
        columns.appendChild(
          svg("line", {
            x1: xMap(point.x),
            y1: zMap(0),
            x2: xMap(point.x),
            y2: zMap(zTop),
            class: "viewer-column illustrative"
          })
        );
      });
      group.appendChild(columns);
    }

    if (layers.beams) {
      const beams = svg("g", { class: "viewer-beams" });
      runtime.elements.forEach((beam) => {
        beams.appendChild(
          beamGroup(
            beam,
            {
              x1: xMap(beam.start.x),
              y1: zMap(zTop),
              x2: xMap(beam.end.x),
              y2: zMap(zTop)
            },
            beam.id === state.activeElementId,
            layers.labels
          )
        );
      });
      group.appendChild(beams);
    }

    if (layers.joints) {
      const joints = svg("g", { class: "viewer-joints" });
      Object.values(runtime.points).forEach((point) => {
        joints.appendChild(
          svg("circle", {
            cx: xMap(point.x),
            cy: zMap(zTop),
            r: 7,
            class: "verified"
          })
        );
      });
      group.appendChild(joints);
    }

    if (layers.slabs && !verifiedOnly) {
      const slab = svg("g", { class: "viewer-slab-edge" });
      slab.append(
        svg("line", {
          x1: xMap(range.minX),
          y1: zMap(zTop) - 10,
          x2: xMap(range.maxX),
          y2: zMap(zTop) - 10
        }),
        layers.labels
          ? svg(
              "text",
              {
                x: (xMap(range.minX) + xMap(range.maxX)) / 2,
                y: zMap(zTop) - 28,
                "text-anchor": "middle"
              },
              "Illustrative slab edge"
            )
          : document.createDocumentFragment()
      );
      group.appendChild(slab);
    }

    if (layers.dimensions) {
      const dimensions = svg("g", { class: "viewer-dimensions" });
      runtime.elements.forEach((beam) => {
        const x1 = xMap(beam.start.x);
        const x2 = xMap(beam.end.x);
        dimensions.append(
          svg("line", { x1, y1: 540, x2, y2: 540 }),
          svg("line", { x1, y1: 530, x2: x1, y2: 550 }),
          svg("line", { x1: x2, y1: 530, x2, y2: 550 }),
          svg(
            "text",
            { x: (x1 + x2) / 2, y: 566, "text-anchor": "middle" },
            `${query.format(beam.length, 2)} m`
          )
        );
      });
      if (!verifiedOnly) {
        dimensions.append(
          svg("line", { x1: 815, y1: zMap(0), x2: 815, y2: zMap(zTop) }),
          svg("line", { x1: 805, y1: zMap(0), x2: 825, y2: zMap(0) }),
          svg("line", { x1: 805, y1: zMap(zTop), x2: 825, y2: zMap(zTop) }),
          svg(
            "text",
            { x: 838, y: (zMap(0) + zMap(zTop)) / 2 },
            `${query.format(zTop, 2)} m · illustrative`
          )
        );
      }
      group.appendChild(dimensions);
    }

    addAxes(group, { x: 88, y: 520 }, [
      { label: "X", x: 52, y: 0 },
      { label: "Z", x: 0, y: -52 }
    ]);
  }

  function isoProjector(runtime, state) {
    const range = extent(runtime);
    const verifiedOnly = Boolean(state.viewer.layers.verifiedOnly);
    const centerX = (range.minX + range.maxX) / 2;
    const centerY = bayDepth / 2;
    const angle = (state.viewer.orbit * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const raw = (point) => {
      const px = point.x - centerX;
      const py = point.y - centerY;
      const xr = px * cos - py * sin;
      const yr = px * sin + py * cos;
      return { x: xr, y: yr * 0.46 - point.z * 1.1 };
    };
    const candidates = [];
    [range.minX, runtime.points.POINT_B.x, range.maxX].forEach((x) => {
      (verifiedOnly ? [0] : [0, bayDepth]).forEach((y) => {
        (verifiedOnly ? [0] : [0, runtime.levelHeight]).forEach((z) =>
          candidates.push(raw({ x, y, z }))
        );
      });
    });
    const minX = Math.min(...candidates.map((point) => point.x));
    const maxX = Math.max(...candidates.map((point) => point.x));
    const minY = Math.min(...candidates.map((point) => point.y));
    const maxY = Math.max(...candidates.map((point) => point.y));
    const scale = Math.min(680 / Math.max(1, maxX - minX), 410 / Math.max(1, maxY - minY));
    return (point) => {
      const projected = raw(point);
      return {
        x: 480 + (projected.x - (minX + maxX) / 2) * scale,
        y: 326 + (projected.y - (minY + maxY) / 2) * scale
      };
    };
  }

  function renderIso(group, state, runtime) {
    const layers = state.viewer.layers;
    const verifiedOnly = layers.verifiedOnly;
    const zTop = verifiedOnly ? 0 : runtime.levelHeight;
    const project = isoProjector(runtime, state);
    const range = extent(runtime);
    addTitle(
      group,
      "3D ISOMETRIC · X–Y–Z",
      verifiedOnly
        ? "Verified analytical line geometry"
        : "Verified beams within a clearly illustrative frame extension"
    );

    const topPoints = [
      runtime.points.POINT_A.x,
      runtime.points.POINT_B.x,
      runtime.points.POINT_C.x
    ];

    if (layers.grid && !verifiedOnly) {
      const grid = svg("g", { class: "viewer-grid" });
      [0, bayDepth].forEach((y) => {
        const a = project({ x: range.minX, y, z: 0 });
        const b = project({ x: range.maxX, y, z: 0 });
        grid.appendChild(svg("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
      });
      topPoints.forEach((x) => {
        const a = project({ x, y: 0, z: 0 });
        const b = project({ x, y: bayDepth, z: 0 });
        grid.appendChild(svg("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
      });
      group.appendChild(grid);
    }

    if (layers.columns && !verifiedOnly) {
      const columns = svg("g", { class: "viewer-columns" });
      topPoints.forEach((x) => {
        [0, bayDepth].forEach((y) => {
          const base = project({ x, y, z: 0 });
          const top = project({ x, y, z: zTop });
          columns.appendChild(
            svg("line", {
              x1: base.x,
              y1: base.y,
              x2: top.x,
              y2: top.y,
              class: "viewer-column illustrative"
            })
          );
        });
      });
      group.appendChild(columns);
    }

    if (layers.slabs && !verifiedOnly) {
      const slabPoints = [
        project({ x: range.minX, y: 0, z: zTop }),
        project({ x: range.maxX, y: 0, z: zTop }),
        project({ x: range.maxX, y: bayDepth, z: zTop }),
        project({ x: range.minX, y: bayDepth, z: zTop })
      ];
      const slab = svg("g", { class: "viewer-slab" });
      slab.appendChild(
        svg("polygon", {
          points: slabPoints.map((point) => `${point.x},${point.y}`).join(" ")
        })
      );
      group.appendChild(slab);
    }

    if (layers.beams) {
      const beams = svg("g", { class: "viewer-beams" });
      runtime.elements.forEach((beam) => {
        const a = project({ x: beam.start.x, y: 0, z: zTop });
        const b = project({ x: beam.end.x, y: 0, z: zTop });
        beams.appendChild(
          beamGroup(
            beam,
            { x1: a.x, y1: a.y, x2: b.x, y2: b.y },
            beam.id === state.activeElementId,
            layers.labels
          )
        );
      });
      if (!verifiedOnly) {
        runtime.elements.forEach((beam) => {
          const a = project({ x: beam.start.x, y: bayDepth, z: zTop });
          const b = project({ x: beam.end.x, y: bayDepth, z: zTop });
          beams.appendChild(
            svg("line", {
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              class: "viewer-beam illustrative"
            })
          );
        });
        topPoints.forEach((x) => {
          const a = project({ x, y: 0, z: zTop });
          const b = project({ x, y: bayDepth, z: zTop });
          beams.appendChild(
            svg("line", {
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              class: "viewer-beam illustrative"
            })
          );
        });
      }
      group.appendChild(beams);
    }

    if (layers.joints) {
      const joints = svg("g", { class: "viewer-joints" });
      topPoints.forEach((x, index) => {
        const point = project({ x, y: 0, z: zTop });
        joints.append(
          svg("circle", { cx: point.x, cy: point.y, r: 7, class: "verified" }),
          layers.labels
            ? svg(
                "text",
                { x: point.x, y: point.y + 25, "text-anchor": "middle" },
                ["POINT_A", "POINT_B", "POINT_C"][index]
              )
            : document.createDocumentFragment()
        );
      });
      group.appendChild(joints);
    }

    addAxes(group, { x: 90, y: 520 }, [
      { label: "X", x: 52, y: -14 },
      { label: "Y", x: 34, y: 20 },
      { label: "Z", x: 0, y: -58 }
    ]);
  }

  function renderSidebar(state, runtime) {
    const verifiedOnly = state.viewer.layers.verifiedOnly;
    const modeCopy = {
      plan: {
        title: "Plan · true X–Y",
        description:
          "A horizontal projection showing shared beam connectivity without elevation geometry overlaid."
      },
      elevation: {
        title: "Elevation · true X–Z",
        description:
          "A vertical frame projection along the viewer convention named Grid 1."
      },
      iso: {
        title: "3D isometric · X–Y–Z",
        description:
          "One isometric model with no separate top-plan drawing layered over it."
      }
    };
    const copy = modeCopy[state.viewer.mode];
    document.getElementById("viewer-title").textContent = copy.title;
    document.getElementById("viewer-description").textContent = copy.description;
    document.getElementById("viewer-status").textContent = `${
      copy.title
    } · ${verifiedOnly ? "verified analytical geometry only" : "illustrative extension visible"}`;
    document.getElementById("viewer-facts").innerHTML = `
      <div><dt>Verified geometry</dt><dd>Beam AB and Beam BC spans, points and connectivity</dd></div>
      <div><dt>Analytical supports</dt><dd>A fixed · B continuous · C fixed</dd></div>
      <div><dt>Viewer placement</dt><dd>${
        verifiedOnly
          ? "Source coordinate plane Z = 0.00 m"
          : `Illustrative Level 1 at Z = ${query.format(runtime.levelHeight, 2)} m`
      }</dd></div>
      <div><dt>Illustrative objects</dt><dd>Grid names, Grid 2, columns, transverse beams and slab</dd></div>
    `;
    document.getElementById("level-height-output").textContent = `${query.format(
      runtime.levelHeight,
      2
    )} m`;
    document.getElementById("level-height").value = String(runtime.levelHeight);
    document.getElementById("viewer-text-alternative").innerHTML = `
      <p><strong>Projection:</strong> ${copy.title}.</p>
      <p><strong>Verified:</strong> Beam AB connects Point A to Point B; Beam BC connects Point B to Point C. Both spans are generated from the canonical point records.</p>
      <p><strong>Illustrative:</strong> ${
        verifiedOnly
          ? "Hidden in verified-only mode."
          : `The beams are placed at a demonstrative elevation of ${query.format(
              runtime.levelHeight,
              2
            )} m with secondary framing, columns and a slab.`
      }</p>
    `;
  }

  function syncControls(state) {
    document.querySelectorAll("[data-viewer-mode]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.viewerMode === state.viewer.mode)
      );
    });
    document.querySelectorAll("[data-viewer-layer]").forEach((checkbox) => {
      checkbox.checked = Boolean(state.viewer.layers[checkbox.dataset.viewerLayer]);
    });
    document.querySelectorAll("[data-camera^='rotate']").forEach((button) => {
      button.disabled = state.viewer.mode !== "iso";
    });
  }

  function render(state) {
    const runtime = query.runtime(state);
    const camera = document.getElementById("viewer-camera");
    camera.replaceChildren();
    camera.setAttribute("transform", cameraTransform(state.viewer));
    if (state.viewer.mode === "plan") renderPlan(camera, state, runtime);
    else if (state.viewer.mode === "elevation") renderElevation(camera, state, runtime);
    else renderIso(camera, state, runtime);
    renderSidebar(state, runtime);
    syncControls(state);
  }

  function initializeLayers() {
    const container = document.getElementById("viewer-layers");
    container.innerHTML = layerDefinitions
      .map(
        ([id, label]) => `
          <label>
            <input type="checkbox" data-viewer-layer="${id}" ${
              store.get().viewer.layers[id] ? "checked" : ""
            }>
            <span>${label}</span>
          </label>
        `
      )
      .join("");
    container.addEventListener("change", (event) => {
      const input = event.target.closest("[data-viewer-layer]");
      if (!input) return;
      store.set({ viewer: { layers: { [input.dataset.viewerLayer]: input.checked } } });
    });
  }

  function adjustCamera(action) {
    const current = store.get().viewer;
    const patch = {};
    if (action === "rotate-left") patch.orbit = current.orbit - 12;
    if (action === "rotate-right") patch.orbit = current.orbit + 12;
    if (action === "zoom-in") patch.zoom = Math.min(2.2, current.zoom * 1.15);
    if (action === "zoom-out") patch.zoom = Math.max(0.65, current.zoom / 1.15);
    if (action === "fit") Object.assign(patch, { zoom: 1, panX: 0, panY: 0 });
    store.set({ viewer: patch });
  }

  function initializeInteractions() {
    document.querySelectorAll("[data-viewer-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        store.set({
          viewer: {
            mode: button.dataset.viewerMode,
            zoom: 1,
            panX: 0,
            panY: 0
          }
        });
      });
    });
    document.querySelectorAll("[data-camera]").forEach((button) => {
      button.addEventListener("click", () => adjustCamera(button.dataset.camera));
    });
    document.getElementById("level-height").addEventListener("input", (event) => {
      store.set({ viewer: { levelHeight: Number(event.target.value) } });
    });

    const canvas = document.getElementById("structural-viewer");
    canvas.addEventListener("click", (event) => {
      const target = event.target.closest("[data-select-entity]");
      if (target) store.select(target.dataset.selectEntity);
    });
    canvas.addEventListener("keydown", (event) => {
      const target = event.target.closest("[data-select-entity]");
      if (target && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        store.select(target.dataset.selectEntity);
        return;
      }
      const current = store.get().viewer;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        store.set({ viewer: { panX: current.panX - 18 } });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        store.set({ viewer: { panX: current.panX + 18 } });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        store.set({ viewer: { panY: current.panY - 18 } });
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        store.set({ viewer: { panY: current.panY + 18 } });
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        adjustCamera("zoom-in");
      } else if (event.key === "-") {
        event.preventDefault();
        adjustCamera("zoom-out");
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        adjustCamera("fit");
      }
    });

    canvas.addEventListener("pointerdown", (event) => {
      if (event.target.closest("[data-select-entity]")) return;
      const current = store.get().viewer;
      pointerSession = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        orbit: current.orbit,
        panX: current.panX,
        panY: current.panY,
        mode: current.mode
      };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!pointerSession || pointerSession.pointerId !== event.pointerId) return;
      const dx = event.clientX - pointerSession.x;
      const dy = event.clientY - pointerSession.y;
      if (pointerSession.mode === "iso") {
        store.set({ viewer: { orbit: pointerSession.orbit + dx * 0.35 } });
      } else {
        store.set({
          viewer: {
            panX: pointerSession.panX + dx,
            panY: pointerSession.panY + dy
          }
        });
      }
    });
    const stop = (event) => {
      if (!pointerSession || pointerSession.pointerId !== event.pointerId) return;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      pointerSession = null;
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  }

  function init() {
    initializeLayers();
    initializeInteractions();
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.viewer = { init };
})();
