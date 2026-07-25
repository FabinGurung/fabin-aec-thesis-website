import { Callout, PageIntro, SectionHeading, SourceNote, StatusBadge } from "@/components/ui";
import { sitePath } from "@/components/site-path";

export const metadata = { title: "Implementation Evidence" };

const evidence = [
  ["element_work_item_linkage_output.png", "Element–work-item linkage", "Ten explicit public-safe rows linking AB and BC to five work items each."],
  ["supabase_sql_editor_query.png", "Verified database counts", "Public-safe count output for the supplied schema inventory."],
  ["supabase_table_view_list.png", "Public database object inventory", "Base-table and view inventory presented without project or role identifiers."],
  ["v_shared_element_dimensions_output.png", "Shared element dimensions", "Public labels, coordinates, dimensions and engineering units for AB and BC."],
  ["v_mdm_member_summary_output.png", "MDM member summary", "Final member-end moments and reactions for the two-span prototype."],
  ["v_mdm_joint_summary_output.png", "MDM joint summary", "Fixed, distributed, carry-over and final-moment context at A, B and C."],
  ["v_mdm_health_check_output.png", "MDM health check", "Convergence, tolerance, joint imbalance and duplicate-stiffness checks."],
  ["v_mdm_diagram_points_output.png", "BMD and SFD point records", "Public-safe evidence for the exported diagram-point dataset."],
  ["v_arch_plan_line_elements_output.png", "Architecture line-element output", "Line elements created from the shared A-B-C coordinates."],
  ["v_estimate_beam_concrete_volume_output.png", "Beam concrete quantity output", "L × b × D results for AB and BC."],
] as const;

const qaChecks = [
  "All ten evidence assets are genuine PNG files at 2400 × 1320 pixels.",
  "No browser chrome or Supabase dashboard paths are present.",
  "No organization/project labels, database roles, project references or internal UUIDs are shown.",
  "Evidence images support the authoritative JSON/CSV exports; they do not replace them as source of truth.",
] as const;

export default function EvidencePage() {
  return (
    <>
      <PageIntro
        eyebrow="Implementation evidence"
        title="Sanitized public-safe evidence, kept subordinate to the data exports"
        summary="The gallery uses only the Version 2 assets supplied in 07_site_assets. Each image is a clean PNG without dashboard chrome or internal identifiers."
        badges={[
          { status: "validated", label: "10 genuine PNG assets" },
          { status: "implemented", label: "Static evidence only" },
        ]}
      />

      <section className="section section-tight-top">
        <div className="evidence-policy-grid">
          <div>
            <SectionHeading kicker="Publication-safety gate" title="Verified before inclusion" />
            <div className="qa-checks">
              {qaChecks.map((check) => (
                <div key={check}><span>✓</span><p>{check}</p></div>
              ))}
            </div>
          </div>
          <Callout title="What these images are not" tone="blue">
            <p>
              They are not a live Supabase interface, and this route does not expose a dashboard,
              database credentials, internal IDs or private project metadata.
            </p>
          </Callout>
        </div>
        <SourceNote>
          File-format, dimension, text and visual inspection of `07_site_assets/*.png`, together
          with `01_quality_reports/THESIS_WEBSITE_PUBLIC_SECURITY_CHECK.md`.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Evidence gallery"
          title="Ten views of the implemented prototype"
          text="Open an image to inspect the full-resolution public-safe PNG."
        />
        <div className="evidence-grid">
          {evidence.map(([file, title, description], index) => (
            <figure className="evidence-card" key={file}>
              <a href={sitePath(`/evidence/${file}`)} aria-label={`Open full-resolution ${title} evidence image`}>
                <img src={sitePath(`/evidence/${file}`)} alt={`${title} public-safe evidence`} loading="lazy" />
              </a>
              <figcaption>
                <div><span>{String(index + 1).padStart(2, "0")}</span><StatusBadge status="validated" /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <SourceNote>
          Only files in `07_site_assets/` are displayed. Numerical claims elsewhere on the site
          remain sourced to `website_demo_data.json` and the corresponding public-safe exports.
        </SourceNote>
      </section>

      <section className="section">
        <Callout title="Internal documents remain internal" tone="gray">
          <p>
            The rebuilt thesis PDF and defense presentation are not linked, embedded or offered as
            downloads in this preview. Their publication requires separate approval.
          </p>
        </Callout>
      </section>
    </>
  );
}
