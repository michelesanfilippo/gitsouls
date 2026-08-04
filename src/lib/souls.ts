/**
 * Summon counter, backed by Upstash Redis over its REST API.
 *
 * Deliberately uses plain fetch rather than @upstash/redis: two commands are
 * all we need, and the project has no runtime dependencies beyond Next/React.
 * When the env vars are absent (local dev, forks) every call degrades to null
 * so the UI can simply hide the badge instead of erroring.
 */

const COUNTER_KEY = "gitsouls:summons";
/** Distinct usernames scouted — a set, so repeat visits don't inflate it. */
const SCOUTED_KEY = "gitsouls:scouted";

function config(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** Run one Redis command via the REST API. Returns null on any failure. */
async function command(args: (string | number)[]): Promise<unknown | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      // A counter must never be served from a stale cache.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: unknown };
    return json.result ?? null;
  } catch {
    return null;
  }
}

/** Total distinct profiles ever summoned, or null when unavailable. */
export async function getSoulCount(): Promise<number | null> {
  const result = await command(["SCARD", SCOUTED_KEY]);
  const n = Number(result);
  return Number.isFinite(n) ? n : null;
}

/**
 * Record a summon. Uses SADD so the count tracks distinct bosses rather than
 * page views; the total counter is kept alongside for raw scout volume.
 */
export async function recordSummon(login: string): Promise<void> {
  const key = login.toLowerCase();
  await Promise.all([
    command(["SADD", SCOUTED_KEY, key]),
    command(["INCR", COUNTER_KEY]),
  ]);
}

/** 1234 → "1,234" */
export function formatSouls(n: number): string {
  return n.toLocaleString("en-US");
}
