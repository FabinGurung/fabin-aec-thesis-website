import { thesis } from "@/components/data";
import {
  Callout,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatusBadge,
  StatusLegend,
} from "@/components/ui";

export const metadata = { title: "Limitations and Future Scope" };

const implemented = [
  "Normalized PostgreSQL/Supabase schema",
  "Shared element and dimension hub",
  "Two-span beam MDM workflow",
  "MDM trace, health checks and BMD/SFD point generation",
  "Architecture line-view output",
  "Beam concrete quantity output",
  "Work-item, method-statement and specification linkage",
] as const;

const future = [
  ["Complete IFC import/export", "future"],
  ["Live BIM-software interoperability", "future"],
  ["PostGIS and official GIS datasets", "future"],
  ["Complete-building structural analysis", "future"],
  ["ETABS / SAP2000 / Abaqus integration", "future"],
  ["Complete BOQ, procurement and payment modules", "future"],
  ["CPM / Primavera scheduling", "future"],
  ["Production AI assistant and natural-language SQL", "future"],
  ["Municipal submission and automated code checking", "future"],
] as const;

export default function RoadmapPage() {
  return (
    <>
      <PageIntro
        eyebrow="Limitations and future scope"
        title="A working foundation—not a complete commercial BIM-GIS platform"
        summary="The thesis demonstrates selected database-centered AEC connections. Advanced analysis, spatial integration, scheduling, procurement and AI remain explicitly outside the implemented prototype."
        badges={[
          { status: "implemented", label: "Current prototype" },
          { status: "framework", label: "BIM/GIS concepts" },
          { status: "future", label: "Planned extensions" },
        ]}
      />

      <section className="section section-tight-top">
        <SectionHeading
          kicker="Status boundary"
          title="Implemented claims and future concepts are visually distinct"
          text="A status label is attached wherever readers could otherwise confuse a demonstrated feature with a proposed extension."
        />
        <StatusLegend />
        <div className="scope-columns">
          <div className="scope-panel scope-current">
            <div><StatusBadge status="implemented" /><h3>Current prototype</h3></div>
            <ul>
              {implemented.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="scope-panel scope-future">
            <div><StatusBadge status="future" /><h3>Not implemented</h3></div>
            <ul>
              {future.map(([item]) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
        <SourceNote>
          `03_site_source_of_truth/SOURCE_OF_TRUTH_RULES.md` mandatory distinctions and
          `03_site_source_of_truth/thesis_content.json` implemented modules and truth guardrails.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading kicker="Methodological limitations" title="What the validation does not establish" />
        <div className="prose-panel prose-panel-wide">
          <p>{thesis.methodological_limitations}</p>
        </div>
        <div className="limitation-grid">
          <article><StatusBadge status="future" /><h3>Structural scope</h3><p>One simplified two-span MDM example; no full frame, nonlinear analysis or complete design-code checking.</p></article>
          <article><StatusBadge status="framework" /><h3>BIM scope</h3><p>Relational element modeling and IFC-oriented planning; no complete IFC import/export.</p></article>
          <article><StatusBadge status="framework" /><h3>GIS scope</h3><p>Framework-level spatial concepts; no PostGIS implementation or official spatial datasets.</p></article>
          <article><StatusBadge status="future" /><h3>Field validation</h3><p>The controlled sample is not a complete real Pokhara building project or production deployment.</p></article>
        </div>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` methodological limitations and truth guardrails.
        </SourceNote>
      </section>

      <section className="section section-navy">
        <SectionHeading
          kicker="Recommendations"
          title="Ten evidence-aligned next steps"
          text="These are recommendations from the thesis, not claims that the capabilities already exist."
        />
        <ol className="recommendation-list">
          {thesis.recommendations.map((recommendation, index) => (
            <li key={recommendation}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{recommendation}</p>
              <StatusBadge status="future" />
            </li>
          ))}
        </ol>
        <SourceNote>`03_site_source_of_truth/thesis_content.json` recommendations.</SourceNote>
      </section>

      <section className="section">
        <SectionHeading kicker="Future scope" title="A larger integrated AEC data ecosystem" />
        <div className="future-scope-card">
          <StatusBadge status="future" />
          <p>{thesis.future_scope}</p>
        </div>
        <Callout title="Engineering responsibility" tone="amber">
          <p>
            The current prototype does not replace ETABS, SAP2000 or Abaqus. Any future integration
            would require independent engineering validation, governance, security and professional review.
          </p>
        </Callout>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` future scope and truth guardrails.
        </SourceNote>
      </section>
    </>
  );
}
