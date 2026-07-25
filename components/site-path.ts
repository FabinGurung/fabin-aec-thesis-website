/**
 * Prefix an internal root-relative path with the GitHub Pages project base path.
 *
 * The workflow sets NEXT_PUBLIC_BASE_PATH to /<repository-name> for project
 * sites and to an empty string for <owner>.github.io repositories.
 */
export const SITE_BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function sitePath(path: string): string {
  if (!path || path.startsWith("#") || /^(?:[a-z]+:)?\/\//i.test(path) || /^(?:mailto|tel):/i.test(path)) {
    return path;
  }

  if (!path.startsWith("/")) {
    return path;
  }

  if (!SITE_BASE_PATH) {
    return path;
  }

  if (path === SITE_BASE_PATH || path.startsWith(`${SITE_BASE_PATH}/`)) {
    return path;
  }

  return `${SITE_BASE_PATH}${path}`;
}
