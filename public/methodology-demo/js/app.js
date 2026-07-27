(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;

  const statusText = {
    verified: "Verified",
    derived_verified: "Derived from verified inputs",
    illustrative: "Illustrative",
    linked_only: "Linked only",
    linked: "Linked",
    unknown: "Unknown"
  };

  const statusClass = (status) =>
    status === "derived_verified"
      ? "derived"
      : status === "illustrative"
        ? "illustrative"
        : status === "verified"
          ? "verified"
          : "linked";

  const statusBadge = (status) =>
    `<span class="status-badge ${statusClass(status)}">${
      status === "verified"
        ? "✓ "
        : status === "derived_verified"
          ? "ƒ "
          : status === "illustrative"
            ? "◇ "
            : "↗ "
    }${statusText[status] || status}</span>`;

  function initializeNavigation() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
      toggle.querySelector(".sr-only").textContent = "Open navigation";
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
      toggle.querySelector(".sr-only").textContent = open
        ? "Close navigation"
        : "Open navigation";
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) close();
    });
  }

  function initializeSelection() {
    document.addEventListener("click", (event) => {
      const control = event.target.closest("[data-select-entity]");
      if (!control) return;
      store.select(control.dataset.selectEntity);
    });
  }

  function renderEvidence(runtime) {
    const container = document.getElementById("evidence-summary");
    if (!container) return;
    const items = [
      {
        value: model.points.length,
        label: "verified project points",
        detail: "A · B · C"
      },
      {
        value: model.elements.length,
        label: "shared beam elements",
        detail: "AB · BC"
      },
      {
        value: model.elementWorkLinks.length,
        label: "verified work links",
        detail: "five per beam"
      },
      {
        value: `${query.format(runtime.concreteTotal, 3)} m³`,
        label: "verified concrete",
        detail: "shared-dimension output"
      }
    ];
    container.innerHTML = items
      .map(
        (item) => `
          <div class="evidence-item">
            <strong>${item.value}</strong>
            <span>${item.label}</span>
            <small>${item.detail}</small>
          </div>
        `
      )
      .join("");
  }

  function selectedElement(state, runtime) {
    return runtime.elements.find((item) => item.id === state.activeElementId);
  }

  function renderHero(state, runtime) {
    const element = selectedElement(state, runtime);
    const result = runtime.analysis.results[element.id];
    const section = element.section;
    const sandboxStatus = runtime.isSandbox ? "illustrative" : "verified";

    document.getElementById("meta-student").textContent = model.meta.student;
    document.getElementById("meta-release").textContent = model.meta.release;
    document.getElementById("hero-record-title").textContent = `Beam ${element.label}`;
    document.getElementById("hero-element-id").textContent = element.id;

    const badge = document.querySelector(".hero-record .status-badge");
    badge.className = `status-badge ${statusClass(sandboxStatus)}`;
    badge.textContent = runtime.isSandbox ? "◇ Sandbox copy" : "✓ Verified";

    const facts = [
      ["Connectivity", `${element.start.label} → ${element.end.label}`],
      ["Span", `${query.format(element.length, 2)} m`],
      [
        "Section",
        `${query.format(query.value(section.breadth), 2)} × ${query.format(
          query.value(section.depth),
          2
        )} m`
      ],
      ["EI", `${query.format(result.ei, 0)} kN·m²`],
      ["UDL", `${query.format(result.udl, 2)} kN/m`],
      [
        "Concrete",
        `${query.format(
          runtime.quantities.find((item) => item.elementId === element.id).value,
          3
        )} m³`
      ]
    ];
    document.getElementById("hero-record-grid").innerHTML = facts
      .map(([term, detail]) => `<div><dt>${term}</dt><dd>${detail}</dd></div>`)
      .join("");
  }

  function renderElementInspector(state, runtime) {
    const element = selectedElement(state, runtime);
    const result = runtime.analysis.results[element.id];
    const quantity = runtime.quantities.find((item) => item.elementId === element.id);
    const section = element.section;
    const heading = document.getElementById("element-title");
    const badge = document.getElementById("element-status");
    heading.textContent = `Beam ${element.label}`;
    badge.className = `status-badge ${runtime.isSandbox ? "illustrative" : "verified"}`;
    badge.textContent = runtime.isSandbox ? "◇ Sandbox copy" : "✓ Verified";

    const properties = [
      ["ID", element.id, "verified"],
      ["Type", "Beam", "verified"],
      ["Start point", element.startPointId, "verified"],
      ["End point", element.endPointId, "verified"],
      ["Length", `${query.format(element.length, 2)} m`, runtime.isSandbox ? "illustrative" : "derived_verified"],
      ["Breadth", `${query.format(query.value(section.breadth), 2)} m`, "verified"],
      ["Depth", `${query.format(query.value(section.depth), 2)} m`, "verified"],
      ["Flexural rigidity", `${query.format(result.ei, 0)} kN·m²`, "verified"],
      ["Distributed load", `${query.format(result.udl, 2)} kN/m`, "verified"],
      ["Concrete volume", `${query.format(quantity.value, 3)} m³`, runtime.isSandbox ? "illustrative" : "verified"]
    ];
    document.getElementById("element-properties").innerHTML = properties
      .map(
        ([term, detail, status]) => `
          <div>
            <dt>${term}</dt>
            <dd><span>${detail}</span>${statusBadge(status)}</dd>
          </div>
        `
      )
      .join("");

    const resultId = element.id === "BEAM_AB" ? "RESULT_AB" : "RESULT_BC";
    const quantityId = element.id === "BEAM_AB" ? "QTY_CONCRETE_AB" : "QTY_CONCRETE_BC";
    const links = model.elementWorkLinks.filter((item) => item.elementId === element.id);
    const references = [
      ["Geometry", `${element.startPointId} · ${element.endPointId}`],
      ["Section", element.sectionId],
      ["Property", element.property.id],
      ["Load", element.load.id],
      ["Analysis result", resultId],
      ["Quantity", quantityId],
      ["Work/document links", `${links.length} linked records`]
    ];
    document.getElementById("element-references").innerHTML = references
      .map(
        ([label, ref]) => `
          <div class="reference-row">
            <span>${label}</span>
            <code>${ref}</code>
          </div>
        `
      )
      .join("");
  }

  function renderIntegrity() {
    const result = AEC.integrity.validate();
    const banner = document.getElementById("integrity-banner");
    banner.classList.toggle("failed", !result.passed);
    banner.innerHTML = `
      <span aria-hidden="true">${result.passed ? "✓" : "!"}</span>
      <div>
        <strong>Data integrity: ${result.passed ? "passed" : "attention required"}</strong>
        <small>${result.passedCount} of ${result.totalCount} structural and relational checks passed.</small>
      </div>
    `;
    return result;
  }

  function renderSelection(state, runtime) {
    const element = selectedElement(state, runtime);
    document.querySelectorAll("[data-select-entity]").forEach((button) => {
      const active = button.dataset.selectEntity === element.id;
      button.setAttribute("aria-pressed", String(active));
    });
    const status = document.getElementById("selection-status");
    status.textContent = `Beam ${element.label} selected across all views${
      runtime.isSandbox ? " · sandbox copy active" : ""
    }`;
    document.documentElement.dataset.sandbox = runtime.isSandbox ? "true" : "false";
  }

  function renderScope() {
    const lists = {
      "verified-scope-list": [
        "Point coordinates and AB/BC connectivity",
        "Beam section and flexural rigidity",
        "AB full-span UDL and BC zero UDL",
        "MDM final moments, reactions and health checks",
        "Concrete volumes and ten element–work links",
        "Six method steps and five specification clauses"
      ],
      "derived-scope-list": [
        "Element length calculated from endpoint coordinates",
        "Continuous BMD/SFD equations from verified end actions",
        "Zero AFD from the verified no-axial-load case",
        "Analytical BMD critical location and value",
        "Frontend referential-integrity checks"
      ],
      "illustrative-scope-list": [
        "Grid names, Grid 2 and secondary framing",
        "Columns, slab and configurable storey elevation",
        "Downstream planning relationships without durations",
        "Change-propagation sandbox values",
        "Future IFC/PostGIS framework connections"
      ]
    };
    Object.entries(lists).forEach(([id, items]) => {
      document.getElementById(id).innerHTML = items
        .map((item) => `<li>${item}</li>`)
        .join("");
    });
  }

  function render(state) {
    const runtime = query.runtime(state);
    renderHero(state, runtime);
    renderEvidence(runtime);
    renderElementInspector(state, runtime);
    renderSelection(state, runtime);
  }

  function initializeActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;
    const links = [...document.querySelectorAll(".site-nav a")];
    const targets = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach((link) => {
          const active = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: [0.05, 0.2] }
    );
    targets.forEach((target) => observer.observe(target));
  }

  function init() {
    initializeNavigation();
    initializeSelection();
    initializeActiveNavigation();
    renderScope();
    renderIntegrity();

    const modules = AEC.modules || {};
    [
      "graph",
      "viewer",
      "architecture",
      "engineering",
      "construction",
      "lineage",
      "sandbox"
    ].forEach((name) => modules[name] && modules[name].init && modules[name].init());

    store.subscribe(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
