(function () {
  "use strict";

  const AEC = window.AEC;
  const { model, query, store } = AEC;
  const NS = "http://www.w3.org/2000/svg";

  function svg(name, attributes, text) {
    const node = document.createElementNS(NS, name);
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value != null) node.setAttribute(key, value);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  function statusPill(isSandbox) {
    return `<span class="status-badge ${
      isSandbox ? "illustrative" : "verified"
    }">${isSandbox ? "◇ Sandbox" : "✓ Verified"}</span>`;
  }

  function renderFlow(state, runtime) {
    const element = runtime.elements.find((item) => item.id === state.activeElementId);
    const result = runtime.analysis.results[element.id];
    const stages = [
      {
        label: element.id,
        detail: `${element.startPointId} → ${element.endPointId}`
      },
      {
        label: "Shared inputs",
        detail: `L ${query.format(element.length, 2)} m · EI ${query.format(
          result.ei,
          0
        )} kN·m²`
      },
      {
        label: "Load + end conditions",
        detail: `${query.format(result.udl, 2)} kN/m · ${
          element.id === "BEAM_AB" ? "fixed–continuous" : "continuous–fixed"
        }`
      },
      {
        label: "Deterministic MDM",
        detail: `Steps ${model.solveCases[0].sourceStepOrders.join(" · ")}`
      },
      {
        label: "Traceable output",
        detail: "Moments · reactions · BMD · SFD · AFD"
      }
    ];
    document.getElementById("engineering-flow").innerHTML = stages
      .map(
        (stage, index) => `
          <div class="flow-stage">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${stage.label}</strong>
            <small>${stage.detail}</small>
          </div>
          ${index < stages.length - 1 ? '<i aria-hidden="true">→</i>' : ""}
        `
      )
      .join("");
  }

  function renderResults(state, runtime) {
    const rows = runtime.elements
      .map((element) => {
        const result = runtime.analysis.results[element.id];
        const selected = element.id === state.activeElementId;
        return `
          <tr class="${selected ? "selected-row" : ""}">
            <th scope="row">
              <button type="button" class="table-select" data-select-entity="${element.id}">
                ${element.id}
              </button>
            </th>
            <td>${query.formatSigned(result.nearMoment, 3)} / ${query.formatSigned(
              result.farMoment,
              3
            )} kN·m</td>
            <td>${query.formatSigned(result.nearReaction, 3)} / ${query.formatSigned(
              result.farReaction,
              3
            )} kN</td>
            <td>${statusPill(runtime.isSandbox)}</td>
          </tr>
        `;
      })
      .join("");
    document.getElementById("engineering-results").innerHTML = rows;

    const health = [
      {
        label: "Joint B imbalance",
        value: `${query.format(runtime.analysis.joint.finalImbalance, 3)} kN·m`,
        passed: Math.abs(runtime.analysis.joint.finalImbalance) < 1e-6
      },
      {
        label: "Duplicate stiffness",
        value: String(model.verificationBaseline.duplicateStiffnessLocations),
        passed: model.verificationBaseline.duplicateStiffnessLocations === 0
      },
      {
        label: "Converged",
        value: model.verificationBaseline.isConverged ? "TRUE" : "FALSE",
        passed: model.verificationBaseline.isConverged
      },
      {
        label: "Solve healthy",
        value: model.verificationBaseline.isSolveHealthy ? "TRUE" : "FALSE",
        passed: model.verificationBaseline.isSolveHealthy
      }
    ];
    document.getElementById("health-checks").innerHTML = health
      .map(
        (item) => `
          <div class="health-item ${item.passed ? "passed" : "failed"}">
            <span aria-hidden="true">${item.passed ? "✓" : "!"}</span>
            <small>${item.label}</small>
            <strong>${item.value}</strong>
          </div>
        `
      )
      .join("");
  }

  function renderTrace(runtime) {
    document.getElementById("mdm-trace").innerHTML = runtime.analysis.trace
      .map(
        (step, index) => `
          <details ${index === 0 ? "open" : ""}>
            <summary>
              <span class="trace-step">${step.order}</span>
              <span><strong>${step.title}</strong><small>${step.code}</small></span>
            </summary>
            <div class="trace-detail">
              <p>${step.summary}</p>
              <code>${step.formula}</code>
            </div>
          </details>
        `
      )
      .join("");
  }

  function sample(result, type, count) {
    const points = [];
    const steps = Math.max(1, count || 60);
    for (let index = 0; index <= steps; index += 1) {
      const x = (result.length * index) / steps;
      const y =
        type === "bmd"
          ? result.momentAt(x)
          : type === "sfd"
            ? result.shearAt(x)
            : result.axialAt(x);
      points.push({ x, y });
    }
    return points;
  }

  function pathFrom(points, xScale, yScale) {
    return points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${xScale(point.x).toFixed(2)} ${yScale(
            point.y
          ).toFixed(2)}`
      )
      .join(" ");
  }

  function chartDescription(type, result, elementId) {
    if (type === "bmd") {
      return `${elementId} bending moment varies according to M(x) = M near plus near reaction times x minus w x squared over two.`;
    }
    if (type === "sfd") {
      return `${elementId} shear force varies according to V(x) = near reaction minus w x.`;
    }
    return `${elementId} has no axial loading; axial force is zero throughout.`;
  }

  function renderChart(svgId, type, result, elementId, isSandbox) {
    const container = document.getElementById(svgId);
    container.replaceChildren();
    const points = sample(result, type, type === "bmd" ? 72 : 24);
    const values = points.map((point) => point.y);
    let minY = Math.min(0, ...values);
    let maxY = Math.max(0, ...values);
    if (Math.abs(maxY - minY) < 1e-9) {
      minY = -1;
      maxY = 1;
    } else {
      const pad = (maxY - minY) * 0.12;
      minY -= pad;
      maxY += pad;
    }
    const xScale = (x) => 62 + (x / result.length) * 540;
    const yScale = (y) => 35 + ((maxY - y) / (maxY - minY)) * 210;
    const zeroY = yScale(0);
    const unit = type === "bmd" ? "kN·m" : "kN";

    container.append(
      svg("title", {}, `${elementId} ${type.toUpperCase()}`),
      svg("desc", {}, chartDescription(type, result, elementId))
    );

    const grid = svg("g", { class: "diagram-grid-lines" });
    [0, 0.5, 1].forEach((fraction) => {
      const x = xScale(result.length * fraction);
      grid.append(
        svg("line", { x1: x, y1: 30, x2: x, y2: 254 }),
        svg(
          "text",
          { x, y: 278, "text-anchor": "middle" },
          `${query.format(result.length * fraction, fraction === 0.5 ? 2 : 1)} m`
        )
      );
    });
    [minY, 0, maxY].forEach((value) => {
      const y = yScale(value);
      grid.append(
        svg("line", { x1: 62, y1: y, x2: 602, y2: y }),
        svg(
          "text",
          { x: 52, y: y + 4, "text-anchor": "end" },
          query.format(value, 1)
        )
      );
    });
    container.appendChild(grid);

    const areaPath = `${pathFrom(points, xScale, yScale)} L ${xScale(
      result.length
    )} ${zeroY} L ${xScale(0)} ${zeroY} Z`;
    container.appendChild(
      svg("path", {
        d: areaPath,
        class: `diagram-area ${type}${isSandbox ? " sandbox" : ""}`
      })
    );
    container.appendChild(
      svg("line", {
        x1: 62,
        y1: zeroY,
        x2: 602,
        y2: zeroY,
        class: "diagram-zero-line"
      })
    );
    container.appendChild(
      svg("path", {
        d: pathFrom(points, xScale, yScale),
        class: `diagram-line ${type}${isSandbox ? " sandbox" : ""}`
      })
    );

    const probeCount = 12;
    const probeLayer = svg("g", { class: "diagram-probes" });
    for (let index = 0; index <= probeCount; index += 1) {
      const x = (result.length * index) / probeCount;
      const y =
        type === "bmd"
          ? result.momentAt(x)
          : type === "sfd"
            ? result.shearAt(x)
            : 0;
      const probe = svg("circle", {
        cx: xScale(x),
        cy: yScale(y),
        r: 7,
        tabindex: "0",
        role: "img",
        class: "diagram-probe",
        "data-chart-type": type.toUpperCase(),
        "data-member": elementId,
        "data-x": x,
        "data-y": y,
        "data-unit": unit,
        "aria-label": `${elementId}, x ${query.format(x, 2)} metres, ${
          type === "bmd" ? "moment" : type === "sfd" ? "shear" : "axial force"
        } ${query.formatSigned(y, 3)} ${unit}`
      });
      probe.appendChild(
        svg(
          "title",
          {},
          `x = ${query.format(x, 2)} m · ${query.formatSigned(y, 3)} ${unit}`
        )
      );
      probeLayer.appendChild(probe);
    }
    container.appendChild(probeLayer);

    const labels = svg("g", { class: "diagram-value-labels" });
    const startValue =
      type === "bmd"
        ? result.momentAt(0)
        : type === "sfd"
          ? result.shearAt(0)
          : 0;
    const endValue =
      type === "bmd"
        ? result.momentAt(result.length)
        : type === "sfd"
          ? result.shearAt(result.length)
          : 0;
    labels.append(
      svg(
        "text",
        { x: 70, y: Math.max(20, yScale(startValue) - 12) },
        query.formatSigned(startValue, 2)
      ),
      svg(
        "text",
        {
          x: 594,
          y: Math.max(20, yScale(endValue) - 12),
          "text-anchor": "end"
        },
        query.formatSigned(endValue, 2)
      )
    );
    if (type === "bmd" && result.criticalX != null) {
      labels.append(
        svg("line", {
          x1: xScale(result.criticalX),
          y1: zeroY,
          x2: xScale(result.criticalX),
          y2: yScale(result.criticalMoment),
          class: "diagram-critical-line"
        }),
        svg(
          "text",
          {
            x: xScale(result.criticalX),
            y: yScale(result.criticalMoment) - 12,
            "text-anchor": "middle"
          },
          `${query.formatSigned(result.criticalMoment, 2)} @ ${query.format(
            result.criticalX,
            3
          )} m`
        )
      );
    }
    container.appendChild(labels);
  }

  function polynomial(result) {
    const constant = query.formatSigned(result.nearMoment, 3);
    const linear = query.formatSigned(result.nearReaction, 3);
    const quadratic = query.formatSigned(-result.udl / 2, 3);
    return `M(x) = ${constant} ${linear.startsWith("-") ? "−" : "+"} ${query.format(
      Math.abs(result.nearReaction),
      3
    )}x ${quadratic.startsWith("-") ? "−" : "+"} ${query.format(
      Math.abs(result.udl / 2),
      3
    )}x²`;
  }

  function shearEquation(result) {
    return `V(x) = ${query.formatSigned(result.nearReaction, 3)} ${
      result.udl === 0 ? "" : `− ${query.format(result.udl, 3)}x`
    }`.trim();
  }

  function renderDiagrams(state, runtime) {
    const elementId = state.activeElementId;
    const element = runtime.elements.find((item) => item.id === elementId);
    const result = runtime.analysis.results[elementId];
    document.getElementById("diagram-member-title").textContent = `${element.id} · ${query.format(
      element.length,
      2
    )} m`;
    renderChart("bmd-chart", "bmd", result, elementId, runtime.isSandbox);
    renderChart("sfd-chart", "sfd", result, elementId, runtime.isSandbox);
    renderChart("afd-chart", "afd", result, elementId, runtime.isSandbox);
    document.getElementById("bmd-note").innerHTML = `
      <code>${polynomial(result)}</code>
      <span>${
        result.udl === 0
          ? "No distributed load: the BMD is linear."
          : "UDL present: the analytical BMD is parabolic, rendered from continuous evaluation points."
      }</span>
    `;
    document.getElementById("sfd-note").innerHTML = `
      <code>${shearEquation(result)}</code>
      <span>${
        result.udl === 0
          ? "No distributed load: member shear is constant."
          : "Constant UDL: shear varies linearly."
      }</span>
    `;
    document.getElementById("afd-note").innerHTML = `
      <code>N(x) = 0</code>
      <span>No axial load is present in the verified load case; the zero AFD is a deterministic derivation, not an exported database diagram.</span>
    `;
  }

  function render(state) {
    const runtime = query.runtime(state);
    renderFlow(state, runtime);
    renderResults(state, runtime);
    renderTrace(runtime);
    renderDiagrams(state, runtime);
  }

  function initializeTooltips() {
    const tooltip = document.getElementById("chart-tooltip");
    const show = (target, event) => {
      if (!target?.classList.contains("diagram-probe")) return;
      tooltip.hidden = false;
      tooltip.innerHTML = `
        <strong>${target.dataset.member} · ${target.dataset.chartType}</strong>
        <span>x = ${query.format(Number(target.dataset.x), 2)} m</span>
        <span>${query.formatSigned(Number(target.dataset.y), 3)} ${
          target.dataset.unit
        }</span>
      `;
      const x = event?.clientX || target.getBoundingClientRect().left;
      const y = event?.clientY || target.getBoundingClientRect().top;
      tooltip.style.left = `${Math.min(window.innerWidth - 190, x + 12)}px`;
      tooltip.style.top = `${Math.max(8, y - 72)}px`;
    };
    const hide = () => {
      tooltip.hidden = true;
    };
    document.querySelectorAll(".diagram-card svg").forEach((chart) => {
      chart.addEventListener("pointerover", (event) => show(event.target, event));
      chart.addEventListener("pointermove", (event) => show(event.target, event));
      chart.addEventListener("pointerout", (event) => {
        if (event.target.classList?.contains("diagram-probe")) hide();
      });
      chart.addEventListener("focusin", (event) => show(event.target, event));
      chart.addEventListener("focusout", hide);
    });
  }

  function init() {
    initializeTooltips();
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.engineering = { init };
})();
