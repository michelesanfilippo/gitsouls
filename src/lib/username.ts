/** GitHub's own handle rules: alphanumeric with single inner hyphens, max 39. */
export const VALID_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Extract a bare username from raw input (handles @user and github URLs). */
export function parseUsername(raw: string): string {
  let v = raw.trim();
  const urlMatch = v.match(/github\.com\/([^/?#]+)/i);
  if (urlMatch) v = urlMatch[1];
  return v.replace(/^@/, "").trim();
}
