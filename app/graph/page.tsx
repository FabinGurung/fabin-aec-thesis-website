import { SystemGraph } from "@/components/system-graph";
import { Callout, PageIntro, SourceNote } from "@/components/ui";

export const metadata = { title: "AEC System Relationship Graph" };

export default function GraphPage() {
  return (
    <>
      <PageIntro
        eyebrow="Interactive system map"
        title="AEC System Relationship Graph"
        summary="Explore how the research, normalized relational database, implemented MDM calculations, reporting views, validated outputs and explicitly bounded future concepts connect."
        badges={[
          { status: "implemented", label: "Curated local data" },
          { status: "validated", label: "Source-backed relationships" },
          { status: "future", label: "Future work separated" },
        ]}
      />

      <section className="section graph-page-section section-tight-top">
        <Callout title="Interpretation boundary" tone="blue">
          <p>
            This is a curated interactive visualization of the thesis system, not a graph database
            or complete representation of every database relationship. The normalized relational
            PostgreSQL database remains the source of truth.
          </p>
        </Callout>
        <SystemGraph />
        <SourceNote>
          Curated from `data/thesis_content.json`, `data/website_demo_data.json`, the Version 2
          database inventory, simplified relationship diagram, verified exports and public-safe
          evidence. The Database Graph intentionally does not show all 52 tables and 24 views at once.
        </SourceNote>
        <Callout title="What this graph does not claim" tone="gray">
          <p>
            The visualization is not machine learning or an engineering calculation engine, is not
            connected live to Supabase, and does not replace the formal relational schema. Future
            IFC, PostGIS, scheduling, procurement and controlled AI nodes are not implemented modules.
          </p>
        </Callout>
      </section>
    </>
  );
}
