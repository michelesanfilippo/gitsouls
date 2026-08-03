import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import BossProfileView from "@/components/BossProfileView";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";

export async function generateMetadata({
  params,
}: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Souls-like boss`,
    description: `The Souls-like boss forged from @${username}'s GitHub profile.`,
  };
}

function RateLimited() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl text-gold">The bonfire is crowded</h1>
      <p className="mt-3 max-w-md text-parchment/70">
        GitHub is rate limiting the summoning. Rest, then try again shortly.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
      >
        Return to the fog
      </Link>
    </div>
  );
}

export default async function BossPage({ params }: PageProps<"/[username]">) {
  const { username } = await params;

  let profile: Awaited<ReturnType<typeof getBossProfile>> | null = null;

  try {
    profile = await getBossProfile(username);
  } catch (err) {
    if (err instanceof GitHubError && err.kind === "not_found") {
      notFound();
    }
    if (!(err instanceof GitHubError && err.kind === "rate_limited")) {
      throw err;
    }
    // rate limited → fall through and render the RateLimited notice
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      {profile ? (
        <main className="flex flex-1 flex-col">
          <BossProfileView profile={profile} />
        </main>
      ) : (
        <RateLimited />
      )}
      <Footer />
    </div>
  );
}
