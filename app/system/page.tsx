import { demo, formatNumber, humanUnit } from "@/components/data";
import { SimplifiedRelationshipMap, SystemArchitectureDiagram } from "@/components/visuals";
import {
  Callout,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatCard,
  StatusBadge,
} from "@/components/ui";

export const metadata = { title: "Database System" };

export default function SystemPage() {
  return (
    <>
      <PageIntro
        eyebrow="Database system"
        title="The database and engineering rules are the source of truth"
        summary="A normalized PostgreSQL/Supabase schema connects reusable project elements to deterministic structural, geometric, quantity and construction-document outputs."
        badges={[
          { status: "implemented", label: "Normalized schema" },
          { status: "implemented", label: "Shared element hub" },
          { status: "validated", label: "Reporting + health views" },
        ]}
      />

      <section className="section section-tight-top">
        <SectionHeading
          kicker="Verified inventory"
          title="Public-schema object count"
          text="Counts were supplied in the authoritative static export and corroborated by the public-safe inventory evidence."
        />
        <div className="stats-grid four-up">
          <StatCard value={demo.database_summary.base_table_count} label="Base tables" />
          <StatCard value={demo.database_summary.view_count} label="Views" />
          <StatCard value={demo.database_summary.materialized_view_count} label="Materialized views" detail="None reported" />
          <StatCard value={demo.database_summary.function_count} label="Functions" detail="None reported" />
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` database summary and
          `06_supabase_handoff/database_metadata/01_public_tables.*` / `03_public_views.*`.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Architecture boundary"
          title="Implemented flow separated from planned integrations"
          text="The diagram mirrors the rebuilt Version 2 architecture source and keeps framework-level concepts outside the validated band."
        />
        <SystemArchitectureDiagram />
        <SourceNote>
          `06_supabase_handoff/diagrams/system_architecture.mmd`. Solid-flow nodes are implemented;
          IFC, PostGIS, CPM/Primavera and the controlled natural-language assistant remain planned.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Shared element + dimension hub"
          title="A and B, then B and C: the reusable geometric spine"
          text="Only public labels and engineering values are shown. Internal identifiers are excluded."
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Start point</th>
                <th>End point</th>
                <th>L</th>
                <th>b</th>
                <th>D</th>
                <th>EI</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demo.shared_dimensions.map((row) => (
                <tr key={row.element_label}>
                  <td><strong>{row.element_label}</strong></td>
                  <td>{row.start_point_label} ({row.start_x}, {row.start_y}, {row.start_z})</td>
                  <td>{row.end_point_label} ({row.end_x}, {row.end_y}, {row.end_z})</td>
                  <td>{formatNumber(row.length_l)} {row.length_unit}</td>
                  <td>{formatNumber(row.breadth_b)} {row.breadth_unit}</td>
                  <td>{formatNumber(row.depth_d)} {row.depth_unit}</td>
                  <td>{formatNumber(row.flexural_rigidity_ei)} {humanUnit(row.ei_unit)}</td>
                  <td><StatusBadge status="implemented" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `shared_dimensions`, corroborated by
          `06_supabase_handoff/raw_exports/11_shared_element_dimensions.*` and the sanitized evidence image.
        </SourceNote>
      </section>

      <section className="section section-navy">
        <SectionHeading
          kicker="Relationship reading aid"
          title="Four connected data domains"
          text="This visual intentionally summarizes the core model instead of implying that every database object is drawn."
        />
        <SimplifiedRelationshipMap />
        <SourceNote>
          `06_supabase_handoff/diagrams/core_relational_model.mmd`. This is a simplified domain map,
          not a complete 76-object ERD.
        </SourceNote>
      </section>

      <section className="section">
        <div className="two-column-callouts">
          <Callout title="Static data only" tone="green">
            <p>
              The website reads frozen JSON bundled at build time. It does not query Supabase, use
              database credentials or expose internal identifiers.
            </p>
          </Callout>
          <Callout title="Partial metadata exports" tone="amber">
            <p>
              `02_columns_PARTIAL_100_ROWS.*` and `04_foreign_keys_PARTIAL_100_ROWS.*` are explicitly
              treated as partial samples. They are not used to claim complete column or foreign-key coverage.
            </p>
          </Callout>
        </div>
      </section>
    </>
  );
}
