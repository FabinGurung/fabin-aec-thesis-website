import { demo, formatNumber, humanUnit, thesis } from "@/components/data";
import { sitePath } from "@/components/site-path";
import {
  Callout,
  SectionHeading,
  SourceNote,
  StatCard,
  StatusBadge,
  StatusLegend,
} from "@/components/ui";

const routeCards = [
  ["/research", "Research", "Problem, questions, objectives and prototype methodology"],
  ["/system", "Database System", "Normalized schema, shared hub and implementation boundary"],
  ["/prototype", "Structural Prototype", "A-B-C beam, MDM trace, results, BMD and SFD"],
  ["/workflow", "Shared-Data Reuse", "Architecture lines, quantities and construction documents"],
  ["/evidence", "Implementation Evidence", "Public-safe evidence images and QA disclosures"],
  ["/roadmap", "Limitations & Future", "What remains framework-level or future work"],
  ["/thesis", "Thesis Details", "Academic metadata, abstract and cited references"],
] as const;

export default function OverviewPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-context">
              <img src={sitePath("/brand/PokharaUniversity.jpg")} alt="Pokhara University logo" />
              <div>
                <span>Pokhara University</span>
                <small>Master of Science in Structural Engineering</small>
              </div>
            </div>
            <p className="eyebrow">MSc thesis · Design and implementation research</p>
            <h1>{demo.thesis.title}</h1>
            <p className="hero-summary">
              A normalized relational database prototype that stores shared AEC data once and
              deterministically reuses it for structural validation, architecture line output,
              concrete quantity estimation and linked construction documentation.
            </p>
            <div className="badge-row">
              <StatusBadge status="implemented">Database-driven prototype</StatusBadge>
              <StatusBadge status="validated">MDM results validated</StatusBadge>
              <StatusBadge status="framework">BIM/GIS framework boundary</StatusBadge>
            </div>
            <dl className="hero-meta">
              <div><dt>Student</dt><dd>{demo.thesis.student}</dd></div>
              <div><dt>Registration</dt><dd>2022-1-90-0005</dd></div>
              <div><dt>University</dt><dd>{demo.thesis.university}</dd></div>
              <div><dt>Submission</dt><dd>{thesis.metadata.submission_date}</dd></div>
            </dl>
          </div>
          <aside className="truth-panel">
            <p className="kicker">Truth model</p>
            <h2>One controlled data spine</h2>
            <div className="truth-flow" aria-label="Source-of-truth workflow">
              <div><span>01</span><strong>Database + engineering rules</strong><small>Authoritative source</small></div>
              <div><span>02</span><strong>Deterministic views</strong><small>Repeatable calculations</small></div>
              <div><span>03</span><strong>Static exported evidence</strong><small>This static website</small></div>
            </div>
            <Callout title="Not machine learning" tone="blue">
              <p>
                The prototype applies relational data and explicit engineering rules. It does not
                train or use a predictive model.
              </p>
            </Callout>
          </aside>
        </div>
      </section>

      <section className="section section-tight-top">
        <SectionHeading
          kicker="Verified snapshot"
          title="Evidence-backed prototype scope"
          text="All values below come from the authoritative Version 2 static export—not from a live Supabase connection."
        />
        <div className="stats-grid five-up">
          <StatCard value={demo.database_summary.base_table_count} label="Base tables" detail="Public-schema inventory" />
          <StatCard value={demo.database_summary.view_count} label="Views" detail="Deterministic outputs" />
          <StatCard value={demo.member_summary.length} label="Beam members" detail="AB and BC" status="implemented" />
          <StatCard value={demo.diagram_points.length} label="Diagram points" detail="BMD + SFD records" />
          <StatCard
            value={`${formatNumber(demo.quantity_total.quantity)} ${humanUnit(demo.quantity_total.unit_code)}`}
            label="Concrete total"
            detail="Two beam elements"
          />
        </div>
        <SourceNote>
          `03_site_source_of_truth/website_demo_data.json`: database summary, member summary,
          diagram-point count and quantity total. Frozen static snapshot; no live query is made.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Shared-data reuse"
          title="One element definition, multiple controlled outputs"
          text="The implemented proof of concept follows two beam elements through four connected AEC uses."
        />
        <div className="reuse-grid">
          <article>
            <span>01</span>
            <StatusBadge status="implemented" />
            <h3>Shared element hub</h3>
            <p>Coordinates, spans, breadth, depth, units and EI are stored as reusable data.</p>
          </article>
          <article>
            <span>02</span>
            <StatusBadge status="validated" />
            <h3>Structural validation</h3>
            <p>The Moment Distribution Method produces traceable moments, reactions and diagram points.</p>
          </article>
          <article>
            <span>03</span>
            <StatusBadge status="implemented" />
            <h3>Geometry + quantity</h3>
            <p>The same coordinates and dimensions generate line elements and concrete volumes.</p>
          </article>
          <article>
            <span>04</span>
            <StatusBadge status="implemented" />
            <h3>Construction documents</h3>
            <p>Elements link explicitly to work items, method steps and specification clauses.</p>
          </article>
        </div>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` implemented modules and
          `03_site_source_of_truth/website_demo_data.json` shared dimensions and delivery package.
        </SourceNote>
      </section>

      <section className="section">
        <div className="boundary-grid">
          <div>
            <SectionHeading kicker="Claim boundary" title="Read the status before the claim" />
            <StatusLegend />
            <p className="body-large">
              The site separates demonstrated functionality from conceptual extensions. Full IFC,
              PostGIS, scheduling, procurement and AI integration remain future work.
            </p>
          </div>
          <div className="guardrail-list">
            {thesis.truth_guardrails.map((guardrail) => (
              <div key={guardrail}>
                <span aria-hidden="true">✓</span>
                <p>{guardrail}</p>
              </div>
            ))}
          </div>
        </div>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` truth guardrails and
          `03_site_source_of_truth/SOURCE_OF_TRUTH_RULES.md` mandatory distinctions.
        </SourceNote>
      </section>

      <section className="section section-navy">
        <SectionHeading
          kicker="Explore the thesis"
          title="Eight focused routes, one evidence chain"
          text="Move from the research problem to the implemented prototype, verified evidence and clearly bounded future scope."
        />
        <div className="route-grid">
          {routeCards.map(([href, title, description], index) => (
            <a className="route-card" href={sitePath(href)} key={href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
