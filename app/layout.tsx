import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fabin Gurung — Database-Centered AEC Thesis",
    template: "%s · Fabin Gurung Thesis",
  },
  description:
    "A static academic website presenting a deterministic, database-driven AEC workflow prototype developed for an MSc thesis at Pokhara University.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const dynamic = "force-static";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
