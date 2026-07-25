import { cleanProblemStatement, thesis } from "@/components/data";
import {
  Callout,
  NumberedList,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatusBadge,
} from "@/components/ui";

export const metadata = { title: "Research" };

const validationMethods = [
  ["Data consistency", "Shared dimensions and coordinates are reused across outputs instead of copied into disconnected files."],
  ["Calculation traceability", "Exported MDM stages retain member, joint, end, value and unit context."],
  ["Health checks", "Joint imbalance, duplicate stiffness locations, tolerance and convergence are evaluated in database views."],
  ["Quantity verification", "Beam concrete volume follows the exported L × b × D rule for both members."],
] as const;

export default function ResearchPage() {
  return (
    <>
      <PageIntro
        eyebrow="Research"
        title="From fragmented AEC records to a reusable relational backbone"
        summary="The study investigates whether normalized shared data can connect selected design, analysis, estimation and construction-documentation workflows in Nepal."
        badges={[
          { status: "implemented", label: "Prototype-based research" },
          { status: "validated", label: "Controlled two-span test" },
        ]}
      />

      <section className="section">
        <div className="reading-grid">
          <div>
            <SectionHeading kicker="Problem" title="Repeated data, weak traceability, disconnected tools" />
          </div>
          <div className="prose-panel">
            <p>{cleanProblemStatement(thesis.problem_statement)}</p>
          </div>
        </div>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` problem statement, summarized from the
          cleaned Chapter 1 thesis files.
        </SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading
          kicker="Research questions"
          title="Five questions structure the investigation"
          text="They progress from schema design and shared-data reuse to BIM/GIS framing, database-driven structural calculation and prototype validation."
        />
        <NumberedList items={thesis.research_questions} />
        <SourceNote>`03_site_source_of_truth/thesis_content.json` research questions.</SourceNote>
      </section>

      <section className="section">
        <SectionHeading kicker="Objectives" title="Design, implement, connect and evaluate" />
        <Callout title="General objective" tone="blue">
          <p>{thesis.general_objective}</p>
        </Callout>
        <div className="objective-grid">
          {thesis.specific_objectives.map((objective, index) => (
            <article key={objective}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{objective}</p>
            </article>
          ))}
        </div>
        <SourceNote>`03_site_source_of_truth/thesis_content.json` general and specific objectives.</SourceNote>
      </section>

      <section className="section section-navy methodology-section">
        <SectionHeading
          kicker="Methodology"
          title="Prototype-based database design and controlled validation"
          text={thesis.research_design}
        />
        <ol className="methodology-flow">
          {thesis.methodology_stages.map((stage, index) => (
            <li key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{stage.replace(/;?\s*and$/i, "").replace(/[.;]$/, "")}</p>
            </li>
          ))}
        </ol>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` methodology stages and research design;
          full context in `04_thesis_project_cleaned/23_methodology.tex`.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Validation logic"
          title="What the prototype checks"
          text="Validation is deterministic and query-backed; it is not predictive model evaluation."
        />
        <div className="validation-grid">
          {validationMethods.map(([title, text]) => (
            <article key={title}>
              <StatusBadge status="validated" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <Callout title="Scope of the test" tone="amber">
          <p>
            The sample is a controlled two-span beam prototype. It was not tested as a complete
            real building project in Pokhara, and it does not establish production-scale performance.
          </p>
        </Callout>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` verified results, methodological
          limitations and truth guardrails.
        </SourceNote>
      </section>
    </>
  );
}
