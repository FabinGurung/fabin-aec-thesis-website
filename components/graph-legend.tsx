import type { GraphShape } from "@/components/graph-types";

const shapeLabels: Array<{ shape: GraphShape; label: string }> = [
  { shape: "concept", label: "Concept" },
  { shape: "table", label: "Table / entity" },
  { shape: "view", label: "Reporting view" },
  { shape: "check", label: "Validation check" },
  { shape: "output", label: "Output" },
];

export function GraphLegend() {
  return (
    <aside className="graph-legend" aria-labelledby="graph-legend-title">
      <strong id="graph-legend-title">Graph legend</strong>
      <div className="graph-legend-statuses">
        <span><i className="legend-swatch tone-database" />Implemented database</span>
        <span><i className="legend-swatch tone-validated" />Validated output</span>
        <span><i className="legend-swatch tone-research" />Research / method</span>
        <span><i className="legend-swatch tone-reporting" />Reporting / evidence</span>
        <span><i className="legend-swatch tone-framework" />Framework-level</span>
        <span><i className="legend-swatch tone-future" />Future work</span>
      </div>
      <div className="graph-legend-shapes" aria-label="Node shapes">
        {shapeLabels.map((item) => (
          <span key={item.shape}>
            <i className={`legend-shape shape-${item.shape}`} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
      <p><i className="legend-line" />Arrowed line: documented direction</p>
      <p><i className="legend-line line-future" />Dashed line: future foundation</p>
    </aside>
  );
}
