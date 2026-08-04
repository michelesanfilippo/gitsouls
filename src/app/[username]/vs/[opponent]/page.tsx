import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import DuelView from "@/components/DuelView";
import { getBossProfile } from "@/lib/profile";
import { GitHubError } from "@/lib/github/client";
import { recordSummon } from "@/lib/souls";

export async function generateMetadata({
  params,
}: PageProps<"/[username]/vs/[opponent]">): Promise<Metadata> {
  const { username, opponent } = await params;
  const title = `${username} vs ${opponent}`;
  const description = `${username} and ${opponent} meet in the arena. Only one leaves.`;
  const image = {
    url: `/${username}/vs/${opponent}/og.png`,
    width: 1200,
    height: 630,
  };

  return {
    title,
    description,
    // A duel preview names two people, so it is the most shareable image we
    // produce — worth overriding the site-wide default for.
    openGraph: { title: `${title} — GitSouls`, description, images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
    alternates: { canonical: `/${username}/vs/${opponent}` },
  };
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl text-gold">{title}</h1>
      <p className="mt-3 max-w-md text-parchment/70">{body}</p>
      <Link
        href="/"
        className="mt-6 text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
      >
        Return to the fog
      </Link>
    </div>
  );
}

export default async function DuelPage({
  params,
}: PageProps<"/[username]/vs/[opponent]">) {
  const { username, opponent } = await params;

  // Duelling yourself is a draw by definition — send them to the profile instead.
  if (username.toLowerCase() === opponent.toLowerCase()) {
    notFound();
  }

  let profiles: [
    Awaited<ReturnType<typeof getBossProfile>>,
    Awaited<ReturnType<typeof getBossProfile>>,
  ] | null = null;
  let rateLimited = false;

  try {
    profiles = await Promise.all([
      getBossProfile(username),
      getBossProfile(opponent),
    ]);
  } catch (err) {
    // Either combatant missing means there is no duel to show.
    if (err instanceof GitHubError && err.kind === "not_found") {
      notFound();
    }
    if (err instanceof GitHubError && err.kind === "rate_limited") {
      rateLimited = true;
    } else {
      throw err;
    }
  }

  if (profiles) {
    await Promise.all([
      recordSummon(profiles[0].login),
      recordSummon(profiles[1].login),
    ]);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar showBack />
      {profiles ? (
        <main className="flex flex-1 flex-col">
          <DuelView left={profiles[0]} right={profiles[1]} />
        </main>
      ) : rateLimited ? (
        <Notice
          title="The bonfire is crowded"
          body="GitHub is rate limiting the summoning. Rest, then try again shortly."
        />
      ) : (
        <Notice
          title="No duel to be had"
          body="One of these bosses could not be summoned."
        />
      )}
      <Footer />
    </div>
  );
}
