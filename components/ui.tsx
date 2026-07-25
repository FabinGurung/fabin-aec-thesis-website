import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { sitePath } from "@/components/site-path";

export type Status = "implemented" | "validated" | "framework" | "future";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={sitePath("/")} aria-label="Fabin Gurung thesis overview">
            <span className="brand-mark" aria-hidden="true">
              FG
            </span>
            <span>
              <strong>Fabin Gurung</strong>
              <small>Database-centered AEC thesis</small>
            </span>
          </a>
          <span className="privacy-chip">Static thesis website</span>
        </div>
        <MobileNavigation />
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <strong>Fabin Gurung · MSc Structural Engineering</strong>
            <p>Pokhara University · Registration No. 2022-1-90-0005</p>
          </div>
          <div>
            <p>
              Deterministic, database-driven AEC prototype. Static Version 2 exports are shown;
              there is no live database connection.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export function StatusBadge({ status, children }: { status: Status; children?: ReactNode }) {
  const labels: Record<Status, string> = {
    implemented: "Implemented",
    validated: "Validated",
    framework: "Framework-level",
    future: "Future work",
  };
  return <span className={`status-badge status-${status}`}>{children ?? labels[status]}</span>;
}

export function PageIntro({
  eyebrow,
  title,
  summary,
  badges,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  badges?: Array<{ status: Status; label?: string }>;
}) {
  return (
    <section className="page-intro">
      <div className="page-intro-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{summary}</p>
          {badges && (
            <div className="badge-row">
              {badges.map((badge) => (
                <StatusBadge key={`${badge.status}-${badge.label ?? ""}`} status={badge.status}>
                  {badge.label}
                </StatusBadge>
              ))}
            </div>
          )}
        </div>
        <div className="intro-grid-motif" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  text,
}: {
  kicker?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      {kicker && <p className="kicker">{kicker}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="source-note">
      <span>Source disclosure</span>
      {children}
    </p>
  );
}

export function StatCard({
  value,
  label,
  detail,
  status = "validated",
}: {
  value: ReactNode;
  label: string;
  detail?: string;
  status?: Status;
}) {
  return (
    <article className="stat-card">
      <StatusBadge status={status} />
      <strong className="stat-value">{value}</strong>
      <h3>{label}</h3>
      {detail && <p>{detail}</p>}
    </article>
  );
}

export function Callout({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "green" | "amber" | "gray";
}) {
  return (
    <aside className={`callout callout-${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="numbered-list">
      {items.map((item, index) => (
        <li key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{item}</p>
        </li>
      ))}
    </ol>
  );
}

export function StatusLegend() {
  return (
    <div className="status-legend" aria-label="Status legend">
      <StatusBadge status="implemented" />
      <StatusBadge status="validated" />
      <StatusBadge status="framework" />
      <StatusBadge status="future" />
    </div>
  );
}
