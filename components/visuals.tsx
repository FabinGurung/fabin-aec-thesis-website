import { demo, formatNumber, humanUnit } from "@/components/data";
import { StatusBadge } from "@/components/ui";

export function BeamDiagram() {
  const [ab, bc] = demo.structural_model.members;
  const section = demo.shared_dimensions[0];
  const arrows = [150, 195, 240, 285, 330, 375, 420];

  return (
    <figure className="technical-figure">
      <svg
        className="beam-svg"
        viewBox="0 0 920 330"
        role="img"
        aria-labelledby="beam-title beam-desc"
      >
        <title id="beam-title">Two-span A-B-C continuous beam</title>
        <desc id="beam-desc">
          Fixed ends at A and C, a continuous joint at B, two six metre spans, and a ten
          kilonewton per metre uniformly distributed load on member AB only.
        </desc>

        <g className="fixed-support">
          <line x1="104" y1="82" x2="104" y2="192" />
          {[90, 108, 126, 144, 162, 180].map((y) => (
            <line x1="82" y1={y + 12} x2="104" y2={y} key={`a-${y}`} />
          ))}
          <line x1="816" y1="82" x2="816" y2="192" />
          {[90, 108, 126, 144, 162, 180].map((y) => (
            <line x1="816" y1={y} x2="838" y2={y + 12} key={`c-${y}`} />
          ))}
        </g>

        <line className="beam-member" x1="104" y1="145" x2="816" y2="145" />
        <line className="member-divider" x1="460" y1="128" x2="460" y2="162" />
        <circle className="joint-node" cx="460" cy="145" r="8" />

        <g className="udl">
          <line x1="130" y1="55" x2="435" y2="55" />
          {arrows.map((x) => (
            <g key={x}>
              <line x1={x} y1="55" x2={x} y2="124" />
              <path d={`M ${x - 5} 116 L ${x} 126 L ${x + 5} 116`} />
            </g>
          ))}
          <text x="282" y="38" textAnchor="middle">
            {formatNumber(ab.udl)} {humanUnit(ab.udl_unit)} UDL
          </text>
        </g>

        <g className="beam-labels">
          <text x="104" y="222" textAnchor="middle">A</text>
          <text x="460" y="222" textAnchor="middle">B</text>
          <text x="816" y="222" textAnchor="middle">C</text>
          <text x="282" y="135" textAnchor="middle">AB</text>
          <text x="638" y="135" textAnchor="middle">BC</text>
          <text x="104" y="244" textAnchor="middle" className="minor-label">fixed</text>
          <text x="460" y="244" textAnchor="middle" className="minor-label">continuous joint</text>
          <text x="816" y="244" textAnchor="middle" className="minor-label">fixed</text>
        </g>

        <g className="dimension-line">
          <line x1="104" y1="280" x2="460" y2="280" />
          <line x1="460" y1="280" x2="816" y2="280" />
          {[104, 460, 816].map((x) => (
            <line x1={x} y1="269" x2={x} y2="291" key={`dim-${x}`} />
          ))}
          <text x="282" y="310" textAnchor="middle">{formatNumber(ab.length)} m</text>
          <text x="638" y="310" textAnchor="middle">{formatNumber(bc.length)} m</text>
        </g>
      </svg>
      <figcaption className="figure-facts">
        <span><strong>b</strong> {formatNumber(section.breadth_b)} m</span>
        <span><strong>D</strong> {formatNumber(section.depth_d)} m</span>
        <span><strong>EI</strong> {formatNumber(ab.flexural_rigidity_ei)} {humanUnit(ab.ei_unit)}</span>
        <span><strong>BC load</strong> {formatNumber(bc.udl)} {humanUnit(bc.udl_unit)}</span>
      </figcaption>
    </figure>
  );
}

type DiagramType = "BMD" | "SFD";

export function DiagramChart({ type }: { type: DiagramType }) {
  const width = 960;
  const height = 410;
  const margin = { top: 42, right: 30, bottom: 58, left: 76 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const points = demo.diagram_points.filter((point) => point.diagram_type === type);
  const values = points.map((point) => point.y_value);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  const spread = Math.max(rawMax - rawMin, 1);
  const min = rawMin - spread * 0.08;
  const max = rawMax + spread * 0.08;
  const xScale = (x: number) => margin.left + (x / 12) * plotWidth;
  const yScale = (y: number) => margin.top + ((max - y) / (max - min)) * plotHeight;
  const yTicks = Array.from({ length: 5 }, (_, index) => rawMin + ((rawMax - rawMin) * index) / 4);
  const xTicks = [0, 3, 6, 9, 12];
  const unit = type === "BMD" ? "kN·m" : "kN";
  const title = type === "BMD" ? "Bending Moment Diagram" : "Shear Force Diagram";
  const groups = ["AB", "BC"].map((member) => ({
    member,
    points: points
      .filter((point) => point.member_label === member)
      .sort((a, b) => a.point_index - b.point_index),
  }));

  return (
    <figure className="technical-figure chart-figure">
      <div className="chart-heading">
        <div>
          <span>{type}</span>
          <h3>{title}</h3>
        </div>
        <div className="chart-legend" aria-label="Member legend">
          <span><i className="legend-ab" />AB</span>
          <span><i className="legend-bc" />BC</span>
        </div>
      </div>
      <svg
        className="diagram-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${type}-title ${type}-desc`}
      >
        <title id={`${type}-title`}>{`${title} for members AB and BC`}</title>
        <desc id={`${type}-desc`}>
          Line chart generated from 26 exported {type} point records, 13 for each member.
        </desc>

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line className="grid-line" x1={margin.left} y1={yScale(tick)} x2={width - margin.right} y2={yScale(tick)} />
            <text className="axis-label" x={margin.left - 12} y={yScale(tick) + 4} textAnchor="end">
              {formatNumber(tick, 2)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line className="grid-line vertical" x1={xScale(tick)} y1={margin.top} x2={xScale(tick)} y2={height - margin.bottom} />
            <text className="axis-label" x={xScale(tick)} y={height - 28} textAnchor="middle">{tick}</text>
          </g>
        ))}
        <line className="zero-line" x1={margin.left} y1={yScale(0)} x2={width - margin.right} y2={yScale(0)} />
        <line className="member-boundary" x1={xScale(6)} y1={margin.top} x2={xScale(6)} y2={height - margin.bottom} />

        {groups.map((group, groupIndex) => {
          const polyline = group.points
            .map((point) => {
              const globalX = point.x_location + (group.member === "BC" ? 6 : 0);
              return `${xScale(globalX)},${yScale(point.y_value)}`;
            })
            .join(" ");
          return (
            <g className={`series series-${group.member.toLowerCase()}`} key={group.member}>
              <polyline points={polyline} />
              {group.points.map((point) => {
                const globalX = point.x_location + (group.member === "BC" ? 6 : 0);
                return (
                  <circle
                    cx={xScale(globalX)}
                    cy={yScale(point.y_value)}
                    r="3.2"
                    key={`${group.member}-${point.point_index}`}
                  >
                    <title>{`${group.member} · x=${point.x_location} m · ${formatNumber(point.y_value)} ${unit}`}</title>
                  </circle>
                );
              })}
              <text
                className="series-label"
                x={xScale(groupIndex === 0 ? 3 : 9)}
                y={margin.top + 18}
                textAnchor="middle"
              >
                Member {group.member}
              </text>
            </g>
          );
        })}

        <text className="axis-title" x={width / 2} y={height - 6} textAnchor="middle">Global span position (m)</text>
        <text className="axis-title" transform={`translate(18 ${height / 2}) rotate(-90)`} textAnchor="middle">{unit}</text>
      </svg>
      <figcaption>
        26 exported records shown: 13 points for AB and 13 for BC. Member-local x values are
        placed on a 0–12 m global span; member-end signs are preserved exactly as exported.
      </figcaption>
    </figure>
  );
}

export function ArchitectureLineDiagram() {
  const width = 920;
  const xScale = (x: number) => 76 + (x / 12) * 768;
  const points = [
    { label: "A", x: 0 },
    { label: "B", x: 6 },
    { label: "C", x: 12 },
  ];

  return (
    <figure className="technical-figure architecture-line-figure">
      <svg viewBox={`0 0 ${width} 300`} role="img" aria-labelledby="arch-line-title arch-line-desc">
        <title id="arch-line-title">Architecture line elements generated from shared coordinates</title>
        <desc id="arch-line-desc">
          Member AB runs from A at zero metres to B at six metres. Member BC runs from B at six
          metres to C at twelve metres. All y and z coordinates are zero.
        </desc>
        <line className="coordinate-axis" x1="76" y1="214" x2="864" y2="214" />
        {[0, 2, 4, 6, 8, 10, 12].map((tick) => (
          <g key={tick}>
            <line className="axis-tick" x1={xScale(tick)} y1="206" x2={xScale(tick)} y2="222" />
            <text className="axis-label" x={xScale(tick)} y="246" textAnchor="middle">{tick}</text>
          </g>
        ))}
        {demo.architecture_lines.map((line, index) => (
          <g className={`architecture-segment segment-${index}`} key={line.element_label}>
            <line x1={xScale(line.start_x)} y1="126" x2={xScale(line.end_x)} y2="126" />
            <text x={(xScale(line.start_x) + xScale(line.end_x)) / 2} y="105" textAnchor="middle">
              {line.element_label} · {formatNumber(line.length_l)} {line.length_unit}
            </text>
          </g>
        ))}
        {points.map((point) => (
          <g className="coordinate-point" key={point.label}>
            <circle cx={xScale(point.x)} cy="126" r="8" />
            <line x1={xScale(point.x)} y1="140" x2={xScale(point.x)} y2="191" />
            <text x={xScale(point.x)} y="70" textAnchor="middle">{point.label}</text>
            <text className="minor-label" x={xScale(point.x)} y="88" textAnchor="middle">({point.x}, 0, 0)</text>
          </g>
        ))}
        <text className="axis-title" x="470" y="278" textAnchor="middle">Shared x-coordinate (m)</text>
      </svg>
      <figcaption>
        Two architecture line elements are generated directly from the supplied A, B and C point
        coordinates; no geometry has been inferred beyond the export.
      </figcaption>
    </figure>
  );
}

export function SystemArchitectureDiagram() {
  return (
    <figure className="architecture-map">
      <div className="architecture-band architecture-implemented">
        <div className="architecture-band-title">
          <StatusBadge status="implemented" />
          <h3>Implemented and validated prototype</h3>
        </div>
        <div className="architecture-flow">
          <div className="architecture-node node-primary">PostgreSQL / Supabase</div>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <div className="architecture-node node-primary">Shared element + dimension hub</div>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <div className="architecture-node-grid">
            <span>MDM calculation views</span>
            <span>Architecture line view</span>
            <span>Concrete quantity</span>
            <span>Work items + documents</span>
          </div>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <div className="architecture-node-grid compact">
            <span>Trace + health checks</span>
            <span>Static JSON / CSV / diagrams</span>
          </div>
        </div>
      </div>
      <div className="planned-connector" aria-hidden="true">planned interfaces ↓</div>
      <div className="architecture-band architecture-future">
        <div className="architecture-band-title">
          <StatusBadge status="framework">Framework-level / Future</StatusBadge>
          <h3>Explicitly outside the implemented prototype</h3>
        </div>
        <div className="future-node-grid">
          <span>Production web application + API</span>
          <span>Controlled natural-language assistant</span>
          <span>IFC / BIM interoperability</span>
          <span>PostGIS / GIS integration</span>
          <span>CPM / Primavera scheduling</span>
        </div>
      </div>
      <figcaption>
        The boundary is intentional: solid-flow functions are implemented; the lower band is
        framework-level or future work and is not presented as operational integration.
      </figcaption>
    </figure>
  );
}

export function SimplifiedRelationshipMap() {
  const domains = [
    {
      title: "Shared project core",
      items: "projects · points · elements · parameters · units",
    },
    {
      title: "Structural model",
      items: "members · member ends · loads · load cases · solve cases",
    },
    {
      title: "Calculation outputs",
      items: "FEM · stiffness · distribution · carry-over · moments · reactions · BMD/SFD",
    },
    {
      title: "Construction links",
      items: "work items · method statements · specifications",
    },
  ];

  return (
    <figure className="relationship-map">
      <div className="diagram-warning">
        <strong>Simplified relationship map</strong>
        <span>This is not a complete 76-object ERD.</span>
      </div>
      <div className="relationship-flow">
        {domains.map((domain, index) => (
          <div className="relationship-step" key={domain.title}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{domain.title}</h3>
              <p>{domain.items}</p>
            </div>
            {index < domains.length - 1 && <b aria-hidden="true">→</b>}
          </div>
        ))}
      </div>
      <figcaption>
        Domain-level reading aid based on the supplied Mermaid relationship diagram. The verified
        inventory contains 52 base tables and 24 views; individual relationships remain in the
        internal database handoff.
      </figcaption>
    </figure>
  );
}
