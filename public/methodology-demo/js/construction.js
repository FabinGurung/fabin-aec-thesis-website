(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;

  const stateLabel = {
    calculated: "Calculated",
    linked_only: "Linked · not quantified",
    linked: "Linked source record"
  };

  function badge(status, label) {
    const className =
      status === "verified"
        ? "verified"
        : status === "illustrative"
          ? "illustrative"
          : "linked";
    const symbol =
      status === "verified" ? "✓" : status === "illustrative" ? "◇" : "↗";
    return `<span class="status-badge ${className}">${symbol} ${label}</span>`;
  }

  function activeContext(state, runtime) {
    const element = runtime.elements.find((item) => item.id === state.activeElementId);
    const quantity = runtime.quantities.find((item) => item.elementId === element.id);
    const links = model.elementWorkLinks.filter((link) => link.elementId === element.id);
    return { element, quantity, links };
  }

  function renderQuantitySummary(state, runtime) {
    const { element, quantity, links } = activeContext(state, runtime);
    const items = [
      {
        eyebrow: element.id,
        value: `${query.format(quantity.value, 3)} m³`,
        label: "Concrete volume",
        status: runtime.isSandbox ? "Sandbox-derived" : "Verified export"
      },
      {
        eyebrow: "Formula",
        value: "L × b × D",
        label: `${query.format(quantity.inputs.length, 2)} × ${query.format(
          quantity.inputs.breadth,
          2
        )} × ${query.format(quantity.inputs.depth, 2)}`,
        status: "Shared dimensions"
      },
      {
        eyebrow: "Project total",
        value: `${query.format(runtime.concreteTotal, 3)} m³`,
        label: "Beam AB + Beam BC",
        status: runtime.isSandbox ? "Sandbox-derived" : "Verified total"
      },
      {
        eyebrow: "Delivery map",
        value: String(links.length),
        label: "Work/document links",
        status: "Verified relationships"
      }
    ];
    document.getElementById("quantity-summary").innerHTML = items
      .map(
        (item) => `
          <article class="quantity-card">
            <small>${item.eyebrow}</small>
            <strong>${item.value}</strong>
            <span>${item.label}</span>
            <em>${item.status}</em>
          </article>
        `
      )
      .join("");
  }

  function renderBoq(state, runtime) {
    const { element, quantity, links } = activeContext(state, runtime);
    document.getElementById(
      "construction-filter-label"
    ).textContent = `Showing Beam ${element.label} links`;

    const rows = links
      .map((link) => {
        const item = model.workItems.find((work) => work.id === link.workItemId);
        const concrete = item.id === "WORK_CONCRETE";
        const basis = concrete
          ? `${query.format(quantity.value, 3)} m³ · ${quantity.formula}`
          : item.dataState === "linked_only"
            ? "Quantity unavailable in verified dataset"
            : item.id === "DOC_METHOD"
              ? `${model.methodTemplates[0].steps.length} source-backed steps`
              : `${model.specificationTemplates[0].clauses.length} source-backed clauses`;
        const status = concrete
          ? runtime.isSandbox
            ? badge("illustrative", "Sandbox calculated")
            : badge("verified", "Calculated")
          : badge("linked", stateLabel[item.dataState]);
        return `
          <tr>
            <th scope="row">
              <button type="button" class="table-select" data-select-entity="${element.id}">
                ${element.id}
              </button>
            </th>
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td>${basis}</td>
            <td>${status}</td>
          </tr>
        `;
      })
      .join("");
    document.getElementById("boq-table").innerHTML = rows;
  }

  function renderDocuments(state) {
    const activeLabel =
      state.activeElementId === "BEAM_AB" ? "Beam AB" : "Beam BC";
    const method = model.methodTemplates[0];
    const specification = model.specificationTemplates[0];
    document.getElementById("method-panel").innerHTML = `
      <div class="document-summary">
        <div>
          <span>${activeLabel} · linked by <code>DOC_METHOD</code></span>
          <h4>${method.title}</h4>
          <p>${method.purpose}</p>
        </div>
        ${badge("verified", "Source-backed")}
      </div>
      <div class="document-list">
        ${method.steps
          .map(
            (step, index) => `
              <details ${index === 0 ? "open" : ""}>
                <summary>
                  <span>${step.order}</span>
                  <strong>${step.title}</strong>
                  <small>${step.responsible}</small>
                </summary>
                <div>
                  <p>${step.description}</p>
                  <p><b>Inspection point:</b> ${step.inspection}</p>
                </div>
              </details>
            `
          )
          .join("")}
      </div>
    `;
    document.getElementById("spec-panel").innerHTML = `
      <div class="document-summary">
        <div>
          <span>${activeLabel} · linked by <code>DOC_SPECIFICATION</code></span>
          <h4>${specification.title}</h4>
          <p>${specification.generalRequirement}</p>
        </div>
        ${badge("verified", "Source-backed")}
      </div>
      <div class="document-list">
        ${specification.clauses
          .map(
            (clause, index) => `
              <details ${index === 0 ? "open" : ""}>
                <summary>
                  <span>${clause.order}</span>
                  <strong>${clause.title}</strong>
                </summary>
                <div>
                  <p>${clause.text}</p>
                  <p><b>Acceptance:</b> ${clause.acceptance}</p>
                </div>
              </details>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderPlanning() {
    document.getElementById("planning-sequence").innerHTML =
      model.illustrativeActivities
        .map(
          (activity) => `
            <li>
              <span aria-hidden="true"></span>
              <div>
                <strong>${activity.name}</strong>
                <small>${
                  activity.predecessorId
                    ? `${activity.relationship} after ${activity.predecessorId}`
                    : "Illustrative sequence start"
                }</small>
              </div>
              ${badge("illustrative", "No duration")}
            </li>
          `
        )
        .join("");
  }

  function renderMaterials(state, runtime) {
    const { element, quantity } = activeContext(state, runtime);
    const cards = [
      {
        type: "concrete",
        name: "Concrete",
        state: `${query.format(quantity.value, 3)} m³ for ${element.id}`,
        status: runtime.isSandbox ? "Sandbox quantity" : "Verified quantity",
        badge: runtime.isSandbox
          ? badge("illustrative", "Sandbox")
          : badge("verified", "Quantified")
      },
      {
        type: "rebar",
        name: "Reinforcement",
        state: "Element relationship verified",
        status: "Mass not available",
        badge: badge("linked", "Linked only")
      },
      {
        type: "formwork",
        name: "Formwork",
        state: "Element relationship verified",
        status: "Area not available",
        badge: badge("linked", "Linked only")
      },
      {
        type: "documents",
        name: "Documents",
        state: "Method + specification linked",
        status: "Source text available",
        badge: badge("verified", "Linked")
      }
    ];
    document.getElementById("material-state-grid").innerHTML = cards
      .map(
        (card) => `
          <article class="material-state-card">
            <div class="material-symbol ${card.type}" aria-hidden="true"><span></span></div>
            <div>
              <h3>${card.name}</h3>
              <p>${card.state}</p>
              <small>${card.status}</small>
            </div>
            ${card.badge}
          </article>
        `
      )
      .join("");
  }

  function render(state) {
    const runtime = query.runtime(state);
    renderQuantitySummary(state, runtime);
    renderBoq(state, runtime);
    renderDocuments(state);
    renderMaterials(state, runtime);
  }

  function initializeTabs() {
    const methodTab = document.getElementById("method-tab");
    const specTab = document.getElementById("spec-tab");
    const methodPanel = document.getElementById("method-panel");
    const specPanel = document.getElementById("spec-panel");
    const activate = (name) => {
      const methodActive = name === "method";
      methodTab.setAttribute("aria-selected", String(methodActive));
      specTab.setAttribute("aria-selected", String(!methodActive));
      methodTab.setAttribute("tabindex", methodActive ? "0" : "-1");
      specTab.setAttribute("tabindex", methodActive ? "-1" : "0");
      methodPanel.hidden = !methodActive;
      specPanel.hidden = methodActive;
      (methodActive ? methodTab : specTab).focus();
    };
    methodTab.addEventListener("click", () => activate("method"));
    specTab.addEventListener("click", () => activate("spec"));
    [methodTab, specTab].forEach((tab) => {
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        activate(tab === methodTab ? "spec" : "method");
      });
    });
  }

  function init() {
    initializeTabs();
    renderPlanning();
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.construction = { init };
})();
