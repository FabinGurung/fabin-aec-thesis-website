(function () {
  "use strict";

  const initialState = Object.freeze({
    selectedEntityId: "BEAM_AB",
    activeElementId: "BEAM_AB",
    graph: {
      mode: "global",
      depth: 2,
      category: "all",
      search: ""
    },
    viewer: {
      mode: "plan",
      levelHeight: 3,
      orbit: -28,
      zoom: 1,
      panX: 0,
      panY: 0,
      layers: {
        grid: true,
        joints: true,
        beams: true,
        columns: true,
        slabs: true,
        labels: true,
        dimensions: true,
        verifiedOnly: false
      }
    },
    sandbox: {
      enabled: false,
      lengthAB: 6
    }
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));
  let state = clone(initialState);
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener(state));
  }

  function set(patch) {
    state = {
      ...state,
      ...patch,
      graph: { ...state.graph, ...(patch.graph || {}) },
      viewer: {
        ...state.viewer,
        ...(patch.viewer || {}),
        layers: {
          ...state.viewer.layers,
          ...((patch.viewer && patch.viewer.layers) || {})
        }
      },
      sandbox: { ...state.sandbox, ...(patch.sandbox || {}) }
    };
    notify();
  }

  function select(entityId) {
    const elementId = window.AEC.query.elementForEntity(entityId);
    set({
      selectedEntityId: entityId,
      activeElementId: elementId || state.activeElementId
    });
  }

  function reset() {
    state = clone(initialState);
    notify();
  }

  window.AEC.store = {
    get: () => state,
    set,
    select,
    reset,
    subscribe(listener, immediate) {
      listeners.add(listener);
      if (immediate !== false) listener(state);
      return () => listeners.delete(listener);
    }
  };
})();
