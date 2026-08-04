import { getSoulCount } from "@/lib/souls";

export const runtime = "nodejs";
/** The count changes constantly — never prerender or cache this. */
export const dynamic = "force-dynamic";

/** Current summon count for the live landing badge. */
export async function GET() {
  const count = await getSoulCount();
  return Response.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );
}
