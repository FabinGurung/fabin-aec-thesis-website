(function () {
  "use strict";

  const AEC = window.AEC;
  const { query, store } = AEC;

  const baselineState = {
    sandbox: { enabled: false, lengthAB: 6 },
    viewer: { levelHeight: 3 }
  };

  function metric(label, baseline, current, unit, decimals, dependency) {
    return { label, baseline, current, unit, decimals, dependency };
  }

  function signedDelta(current, baseline, decimals) {
    const delta = current - baseline;
    return `${delta > 0 ? "+" : ""}${query.format(delta, decimals)}`;
  }

  function render(state) {
    const baseline = query.runtime(baselineState);
    const runtime = query.runtime(state);
    const baseAB = baseline.analysis.results.BEAM_AB;
    const currentAB = runtime.analysis.results.BEAM_AB;
    const baseQuantity = baseline.quantities.find((item) => item.elementId === "BEAM_AB");
    const currentQuantity = runtime.quantities.find(
      (item) => item.elementId === "BEAM_AB"
    );
    const enabled = state.sandbox.enabled;

    const metrics = [
      metric(
        "Architecture span",
        baseAB.length,
        currentAB.length,
        "m",
        2,
        "point coordinates → plan"
      ),
      metric(
        "Point B x-coordinate",
        baseline.points.POINT_B.x,
        runtime.points.POINT_B.x,
        "m",
        2,
        "shared geometry"
      ),
      metric(
        "Member stiffness Kᴮᴬ",
        baseAB.stiffness,
        currentAB.stiffness,
        "kN·m/rad",
        2,
        "4EI/L"
      ),
      metric(
        "AB fixed-end moment at A",
        baseAB.femNear,
        currentAB.femNear,
        "kN·m",
        3,
        "−wL²/12"
      ),
      metric(
        "AB final moment at A",
        baseAB.nearMoment,
        currentAB.nearMoment,
        "kN·m",
        3,
        "MDM distribution"
      ),
      metric(
        "AB concrete volume",
        baseQuantity.value,
        currentQuantity.value,
        "m³",
        3,
        "L × b × D"
      )
    ];

    document.getElementById("sandbox-length").value = String(state.sandbox.lengthAB);
    document.getElementById("sandbox-length-output").textContent = `${query.format(
      state.sandbox.lengthAB,
      2
    )} m`;
    document.getElementById("sandbox-enable").textContent = enabled
      ? "Sandbox enabled"
      : "Enable sandbox";
    document.getElementById("sandbox-enable").setAttribute("aria-pressed", String(enabled));
    document.getElementById("sandbox-status").textContent = enabled
      ? `Demonstration copy active. Verified records remain unchanged; Beam AB sandbox length is ${query.format(
          state.sandbox.lengthAB,
          2
        )} m.`
      : "Verified baseline is active.";

    document.getElementById("propagation-grid").innerHTML = metrics
      .map(
        (item) => `
          <article class="propagation-card ${enabled ? "changed" : ""}">
            <small>${item.dependency}</small>
            <h3>${item.label}</h3>
            <div>
              <span>${query.format(item.baseline, item.decimals)} ${item.unit}</span>
              <i aria-hidden="true">→</i>
              <strong>${query.format(item.current, item.decimals)} ${item.unit}</strong>
            </div>
            <em>Δ ${signedDelta(item.current, item.baseline, item.decimals)} ${
              item.unit
            }</em>
          </article>
        `
      )
      .join("");
  }

  function init() {
    const range = document.getElementById("sandbox-length");
    range.addEventListener("input", (event) => {
      store.set({
        sandbox: {
          enabled: true,
          lengthAB: Number(event.target.value)
        }
      });
    });
    document.getElementById("sandbox-enable").addEventListener("click", () => {
      const current = store.get().sandbox;
      store.set({ sandbox: { enabled: true, lengthAB: current.lengthAB } });
    });
    document.getElementById("sandbox-reset").addEventListener("click", () => {
      store.set({ sandbox: { enabled: false, lengthAB: 6 } });
    });
    store.subscribe(render);
  }

  AEC.modules = AEC.modules || {};
  AEC.modules.sandbox = { init };
})();
