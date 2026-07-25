import demoJson from "@/data/website_demo_data.json";
import referencesJson from "@/data/references.json";
import thesisJson from "@/data/thesis_content.json";

export const demo = demoJson;
export const thesis = thesisJson;
export const references = referencesJson;

export function formatNumber(value: number, maximumFractionDigits = 3) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function humanUnit(unit: string | null | undefined) {
  const units: Record<string, string> = {
    kN_m: "kN·m",
    kN_m2: "kN·m²",
    kN_per_m: "kN/m",
    m2: "m²",
    m3: "m³",
    none: "—",
  };
  return unit ? (units[unit] ?? unit) : "—";
}

export function cleanProblemStatement(value: string) {
  return value.replace(/^Statement of the Problem\s*/i, "");
}

export function displayAuthors(value: string) {
  return value.replace(/\s+and\s+/g, "; ");
}
