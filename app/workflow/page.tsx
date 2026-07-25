import { demo, formatNumber, humanUnit } from "@/components/data";
import { ArchitectureLineDiagram } from "@/components/visuals";
import {
  Callout,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatusBadge,
} from "@/components/ui";

export const metadata = { title: "Shared-Data Reuse" };

export default function WorkflowPage() {
  const methodSteps = demo.method_statement_steps
    .filter((row) => row.element_label === "AB")
    .sort((a, b) => a.step_order - b.step_order);
  const clauses = demo.specification_clauses
    .filter((row) => row.element_label === "AB")
    .sort((a, b) => a.clause_order - b.clause_order);

  return (
    <>
      <PageIntro
        eyebrow="Shared-data reuse"
        title="The same two elements feed geometry, quantities and construction documents"
        summary="AB and BC carry one set of coordinates and dimensions through architecture line output, concrete estimation, work-item linkage, method steps and specification clauses."
        badges={[
          { status: "implemented", label: "Architecture line output" },
          { status: "validated", label: "Concrete quantity" },
          { status: "implemented", label: "Construction linkages" },
        ]}
      />

      <section className="section section-tight-top">
        <SectionHeading
          kicker="Architecture line view"
          title="Two lines generated from the shared point coordinates"
          text="The export supplies A(0,0,0), B(6,0,0) and C(12,0,0); the line diagram below uses those coordinates directly."
        />
        <ArchitectureLineDiagram />
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr><th>Element</th><th>Start</th><th>End</th><th>Length</th><th>Status</th></tr>
            </thead>
            <tbody>
              {demo.architecture_lines.map((row) => (
                <tr key={row.element_label}>
                  <td><strong>{row.element_label}</strong></td>
                  <td>{row.start_point_label} ({row.start_x}, {row.start_y}, {row.start_z})</td>
                  <td>{row.end_point_label} ({row.end_x}, {row.end_y}, {row.end_z})</td>
                  <td>{formatNumber(row.length_l)} {row.length_unit}</td>
                  <td><StatusBadge status="implemented" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          Diagram and table generated from `03_site_source_of_truth/website_demo_data.json` →
          `architecture_lines` (2 records), sourced from `17_architecture_lines.*`.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Concrete quantity"
          title="L × b × D applied to both beam elements"
          text="The dimensions are reused from the shared element hub; the rule and exported results are displayed without recalculation claims beyond the supplied values."
        />
        <div className="quantity-total">
          <StatusBadge status="validated" />
          <span>Total concrete</span>
          <strong>{formatNumber(demo.quantity_total.quantity)} {humanUnit(demo.quantity_total.unit_code)}</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Element</th><th>Rule</th><th>L</th><th>b</th><th>D</th><th>Quantity</th><th>Status</th></tr>
            </thead>
            <tbody>
              {demo.quantity_estimates.map((row) => (
                <tr key={row.element_label}>
                  <td><strong>{row.element_label}</strong></td>
                  <td><code>{row.formula_display}</code></td>
                  <td>{formatNumber(row.length_l)} m</td>
                  <td>{formatNumber(row.breadth_b)} m</td>
                  <td>{formatNumber(row.depth_d)} m</td>
                  <td><strong>{formatNumber(row.quantity)} {humanUnit(row.unit_code)}</strong></td>
                  <td><StatusBadge status="validated" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `quantity_estimates` and
          `quantity_total`, sourced from `18_beam_concrete_quantities.*`. Values are 0.621 m³ per
          element and 1.242 m³ total.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Explicit element/work-item linkage"
          title="Ten verified rows: five links for AB and five for BC"
          text="The Version 2 export makes the relationship explicit and exposes only public labels, codes, names and units."
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Element</th><th>Work-item code</th><th>Work-item name</th><th>Default unit</th></tr>
            </thead>
            <tbody>
              {demo.work_item_links.map((row, index) => (
                <tr key={`${row.element_label}-${row.work_item_code}`}>
                  <td>{index + 1}</td>
                  <td><strong>{row.element_label}</strong></td>
                  <td><code>{row.work_item_code}</code></td>
                  <td>{row.work_item_name}</td>
                  <td>{humanUnit(row.default_unit_code)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `work_item_links`, identical in scope
          to `06_supabase_handoff/raw_exports/22_element_work_item_links.json/.csv` (10 rows).
        </SourceNote>
      </section>

      <section className="section section-navy">
        <SectionHeading
          kicker="Method statement"
          title="Six ordered RCC beam-work steps"
          text="The export contains the same six-step template for AB and BC (12 rows total). One sequence is shown below with its two-element applicability disclosed."
        />
        <div className="document-steps">
          {methodSteps.map((step) => (
            <article key={step.step_order}>
              <span>{String(step.step_order).padStart(2, "0")}</span>
              <div>
                <h3>{step.step_title}</h3>
                <p>{step.step_description}</p>
                <dl>
                  <div><dt>Inspection</dt><dd>{step.inspection_point}</dd></div>
                  <div><dt>Responsible</dt><dd>{step.responsible_party}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `method_statement_steps` (12 rows:
          6 for AB and 6 for BC), sourced from `20_method_statement_steps.*`.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Specification"
          title="Five RCC beam-work clauses with acceptance criteria"
          text="The same five-clause template is linked to both elements (10 rows total)."
        />
        <div className="clause-grid">
          {clauses.map((clause) => (
            <article key={clause.clause_order}>
              <div><span>{String(clause.clause_order).padStart(2, "0")}</span><StatusBadge status="implemented" /></div>
              <h3>{clause.clause_title}</h3>
              <p>{clause.clause_text}</p>
              <strong>Acceptance</strong>
              <p>{clause.acceptance_criteria}</p>
            </article>
          ))}
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `specification_clauses` (10 rows:
          5 for AB and 5 for BC), sourced from `21_specification_clauses.*`.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Delivery package"
          title="One row per element connects the implemented outputs"
          text="The package combines coordinates, dimensions, MDM results, quantities and document counts without claiming a complete BOQ or procurement workflow."
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Element</th><th>Final moments</th><th>Reactions</th><th>Concrete</th><th>Method steps</th><th>Spec clauses</th><th>Health</th></tr>
            </thead>
            <tbody>
              {demo.delivery_package.map((row) => (
                <tr key={row.element_label}>
                  <td><strong>{row.element_label}</strong></td>
                  <td>{formatNumber(row.near_final_moment)} / {formatNumber(row.far_final_moment)} {humanUnit(row.moment_unit_code)}</td>
                  <td>{formatNumber(row.near_reaction)} / {formatNumber(row.far_reaction)} {humanUnit(row.reaction_unit_code)}</td>
                  <td>{formatNumber(row.concrete_quantity)} {humanUnit(row.concrete_quantity_unit)}</td>
                  <td>{row.method_step_count}</td>
                  <td>{row.specification_clause_count}</td>
                  <td><StatusBadge status={row.is_solve_healthy ? "validated" : "framework"}>{row.is_solve_healthy ? "Healthy" : "Review"}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `delivery_package` (2 rows), sourced
          from `19_element_delivery_package.*`.
        </SourceNote>
        <Callout title="Implemented boundary" tone="gray">
          <p>
            Complete BOQ, reinforcement take-off, formwork quantity, procurement, payments and
            scheduling are not implemented in this prototype.
          </p>
        </Callout>
      </section>
    </>
  );
}
