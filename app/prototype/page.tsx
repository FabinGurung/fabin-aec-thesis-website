import { demo, formatNumber, humanUnit } from "@/components/data";
import { BeamDiagram, DiagramChart } from "@/components/visuals";
import {
  Callout,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatCard,
  StatusBadge,
} from "@/components/ui";

export const metadata = { title: "Structural Prototype" };

export default function PrototypePage() {
  const health = demo.health_check;

  return (
    <>
      <PageIntro
        eyebrow="Structural prototype"
        title="A traceable Moment Distribution Method validation"
        summary="The implemented structural method is a controlled two-span A-B-C beam example. Every displayed result is taken from the Version 2 database export."
        badges={[
          { status: "implemented", label: "Moment Distribution Method" },
          { status: "validated", label: "Healthy solve" },
        ]}
      />

      <section className="section section-tight-top">
        <SectionHeading
          kicker="Model definition"
          title="Two six-metre spans with a UDL on AB"
          text="A and C are fixed ends; B is the continuous joint. EI and section dimensions are shared across both members."
        />
        <BeamDiagram />
        <SourceNote>
          Generated from `03_site_source_of_truth/website_demo_data.json` → `structural_model` and
          `shared_dimensions`. No geometry, load or support condition has been added.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Verified member results"
          title="Final end moments and reactions"
          text="Signs are preserved exactly as supplied by the member-summary export."
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Ends</th>
                <th>UDL</th>
                <th>Near moment</th>
                <th>Far moment</th>
                <th>Near reaction</th>
                <th>Far reaction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demo.member_summary.map((row) => (
                <tr key={row.member_label}>
                  <td><strong>{row.member_label}</strong></td>
                  <td>{row.near_joint_label} → {row.far_joint_label}</td>
                  <td>{formatNumber(row.total_udl)} {humanUnit(row.load_unit_code)}</td>
                  <td>{formatNumber(row.near_final_moment)} {humanUnit(row.moment_unit_code)}</td>
                  <td>{formatNumber(row.far_final_moment)} {humanUnit(row.moment_unit_code)}</td>
                  <td>{formatNumber(row.near_reaction)} {humanUnit(row.reaction_unit_code)}</td>
                  <td>{formatNumber(row.far_reaction)} {humanUnit(row.reaction_unit_code)}</td>
                  <td><StatusBadge status="validated" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `member_summary`; public-safe detail in
          `06_supabase_handoff/raw_exports/12_mdm_member_summary.*`.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Health checks"
          title="Equilibrium, convergence and duplicate control"
          text="The solve is marked healthy only within the checks implemented in the exported database views."
        />
        <div className="stats-grid five-up">
          <StatCard value={formatNumber(health.max_continuous_joint_imbalance)} label="Max joint imbalance" detail="kN·m" />
          <StatCard value={health.duplicate_stiffness_locations} label="Duplicate stiffness locations" />
          <StatCard value={formatNumber(health.max_next_unbalanced_moment)} label="Next unbalanced moment" detail="kN·m" />
          <StatCard value={formatNumber(health.moment_tolerance)} label="Moment tolerance" detail="kN·m" />
          <StatCard value={health.is_solve_healthy ? "True" : "False"} label="Solve healthy" />
        </div>
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Joint</th>
                <th>Member end</th>
                <th>Condition</th>
                <th>FEM</th>
                <th>Distribution factor</th>
                <th>Distributed</th>
                <th>Carry-over received</th>
                <th>Final moment</th>
              </tr>
            </thead>
            <tbody>
              {demo.joint_summary.map((row) => (
                <tr key={`${row.joint_label}-${row.member_label}-${row.end_label}`}>
                  <td><strong>{row.joint_label}</strong></td>
                  <td>{row.member_label} · {row.end_label}</td>
                  <td>{row.end_condition_code}</td>
                  <td>{formatNumber(row.fem_total)} {humanUnit(row.moment_unit_code)}</td>
                  <td>{row.distribution_factor === null ? "—" : formatNumber(row.distribution_factor)}</td>
                  <td>{formatNumber(row.distributed_total)} {humanUnit(row.moment_unit_code)}</td>
                  <td>{formatNumber(row.carry_over_received_total)} {humanUnit(row.moment_unit_code)}</td>
                  <td><strong>{formatNumber(row.final_moment)} {humanUnit(row.moment_unit_code)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `health_check` and `joint_summary`;
          corroborated by exports `13_mdm_joint_summary.*` and `15_mdm_health_check.*`.
        </SourceNote>
      </section>

      <section className="section section-navy charts-section">
        <SectionHeading
          kicker="Diagram-point output"
          title="BMD and SFD generated from all 52 supplied records"
          text="Each chart uses 26 records: 13 local x positions for AB and 13 for BC."
        />
        <div className="charts-stack">
          <DiagramChart type="BMD" />
          <SourceNote>
            `03_site_source_of_truth/website_demo_data.json` → 26 BMD records within
            `diagram_points`; detailed export `16_mdm_diagram_points.*`.
          </SourceNote>
          <DiagramChart type="SFD" />
          <SourceNote>
            `03_site_source_of_truth/website_demo_data.json` → 26 SFD records within
            `diagram_points`; detailed export `16_mdm_diagram_points.*`.
          </SourceNote>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Calculation trace"
          title="The exported stage sequence is preserved exactly"
          text="Twenty-two rows document fixed-end moments, stiffness, distribution factors, distributed moments, carry-over received and final end moments."
        />
        <Callout title="No invented Step 6" tone="amber">
          <p>
            The authoritative trace contains step orders 1, 2, 3, 4, 5 and 7. There is no Step 6
            row in the source, so this site does not reconstruct, rename or infer one.
          </p>
        </Callout>
        <div className="table-wrap trace-table">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Code / stage</th>
                <th>Joint</th>
                <th>Member end</th>
                <th>Condition</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {demo.calculation_trace.map((row, index) => (
                <tr key={`${row.step_order}-${row.step_code}-${row.member_label}-${row.end_label}-${index}`}>
                  <td><strong>{row.step_order}</strong></td>
                  <td><code>{row.step_code}</code><small>{row.step_name}</small></td>
                  <td>{row.joint_label}</td>
                  <td>{row.member_label} · {row.end_label}</td>
                  <td>{row.end_condition_code}</td>
                  <td>{formatNumber(row.value, 6)} {humanUnit(row.unit_code)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json` → `calculation_trace` (22 rows),
          sourced from `06_supabase_handoff/raw_exports/14_mdm_calculation_trace.*`.
        </SourceNote>
        <Callout title="Engineering scope" tone="gray">
          <p>
            This database-driven MDM proof of concept does not replace ETABS, SAP2000, Abaqus or
            full finite-element analysis and design-code workflows.
          </p>
        </Callout>
      </section>
    </>
  );
}
