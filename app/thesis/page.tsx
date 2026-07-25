import { displayAuthors, references, thesis } from "@/components/data";
import { sitePath } from "@/components/site-path";
import {
  Callout,
  PageIntro,
  SectionHeading,
  SourceNote,
  StatusBadge,
} from "@/components/ui";

export const metadata = { title: "Thesis Details and References" };

export default function ThesisPage() {
  const metadata = thesis.metadata;

  return (
    <>
      <PageIntro
        eyebrow="Thesis details and references"
        title={metadata.title}
        summary="Academic metadata, abstract and the 26 sources cited in the compiled thesis bibliography."
        badges={[
          { status: "implemented", label: "MSc thesis" },
          { status: "validated", label: "Version 2 source package" },
        ]}
      />

      <section className="section section-tight-top">
        <div className="thesis-profile">
          <div className="university-card">
            <img src={sitePath("/brand/PokharaUniversity.jpg")} alt="Pokhara University logo" />
            <div>
              <p className="kicker">Academic record</p>
              <h2>{metadata.university}</h2>
              <p>{metadata.school}</p>
              <p>{metadata.faculty}</p>
            </div>
          </div>
          <dl className="metadata-list">
            <div><dt>Student</dt><dd>{metadata.student}</dd></div>
            <div><dt>Registration No.</dt><dd>{metadata.registration_number}</dd></div>
            <div><dt>Degree</dt><dd>{metadata.degree}</dd></div>
            <div><dt>Supervisor</dt><dd>{metadata.supervisor}</dd></div>
            <div><dt>Co-supervisor</dt><dd>{metadata.co_supervisor}</dd></div>
            <div><dt>Submission</dt><dd>{metadata.submission_date}</dd></div>
            <div><dt>Country</dt><dd>{metadata.country}</dd></div>
          </dl>
        </div>
        <SourceNote>`03_site_source_of_truth/thesis_content.json` → `metadata`.</SourceNote>
      </section>

      <section className="section section-tinted">
        <SectionHeading kicker="Abstract" title="Research summary" />
        <div className="abstract-copy">
          {thesis.abstract_paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="keyword-row">
          {thesis.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
        </div>
        <SourceNote>
          `03_site_source_of_truth/thesis_content.json` abstract and keywords; cleaned thesis source
          `04_thesis_project_cleaned/10_abstract.tex`.
        </SourceNote>
      </section>

      <section className="section">
        <SectionHeading
          kicker="Conclusions"
          title="What the study supports"
          text="The conclusion remains bounded to the normalized prototype and its controlled sample."
        />
        <div className="conclusion-grid">
          {thesis.conclusion_summary.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
        <SourceNote>`03_site_source_of_truth/thesis_content.json` conclusion summary.</SourceNote>
      </section>

      <section className="section section-navy references-section">
        <SectionHeading
          kicker="Cited bibliography"
          title={`${references.length} references in compiled-thesis order`}
          text="Entries below were extracted from the cleaned BibTeX source and ordered by the compiled IEEE bibliography."
        />
        <ol className="bibliography">
          {references.map((reference) => (
            <li key={reference.key}>
              <span className="reference-number" aria-hidden="true" />
              <div>
                <p className="reference-authors">{displayAuthors(reference.author)}</p>
                <h3>{reference.title}</h3>
                <p className="reference-source">
                  {reference.source}{reference.source && reference.year ? ", " : ""}{reference.year}.
                  {reference.doi && <> DOI: {reference.doi}.</>}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <SourceNote>
          `04_thesis_project_cleaned/27_reference.bib`, filtered and ordered by
          `04_thesis_project_cleaned/main.bbl` (26 cited entries).
        </SourceNote>
      </section>

      <section className="section">
        <Callout title="Downloads intentionally withheld" tone="gray">
          <p>
            The rebuilt thesis and defense presentation were used as internal verification sources
            but are not embedded or offered as public downloads on this static website.
          </p>
        </Callout>
        <div className="download-boundary">
          <StatusBadge status="future">Publication requires separate approval</StatusBadge>
        </div>
      </section>
    </>
  );
}
