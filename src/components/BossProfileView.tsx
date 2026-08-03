import Image from "next/image";
import type { BossProfile } from "@/lib/profile";
import { STAT_LABELS, type StatKey } from "@/lib/scoring/types";
import StatBar from "./StatBar";

const LEFT: StatKey[] = ["VIT", "END", "INT"];
const RIGHT: StatKey[] = ["DEX", "FAI", "SOP"];

/** Full boss layout: stats flank a bordered avatar, lore sits beneath. */
export default function BossProfileView({ profile }: { profile: BossProfile }) {
  const { rank, bossClass, stats } = profile;

  return (
    <div className="animate-fade-up mx-auto w-full max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        {/* Left stats */}
        <div className="order-2 flex flex-col gap-5 md:order-none">
          {LEFT.map((k) => (
            <StatBar key={k} statKey={k} label={STAT_LABELS[k]} value={stats[k]} />
          ))}
        </div>

        {/* Avatar */}
        <div className="order-1 flex flex-col items-center md:order-none">
          <span
            className="mb-3 font-display text-xs uppercase tracking-[0.35em]"
            style={{ color: rank.color }}
          >
            {rank.name}
          </span>
          <div className="relative">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.login} avatar`}
              width={220}
              height={220}
              priority
              className="h-44 w-44 rounded-full object-cover sm:h-52 sm:w-52"
              style={{
                border: `4px solid ${rank.color}`,
                boxShadow: `0 0 55px ${rank.glow}, inset 0 0 20px rgba(0,0,0,0.6)`,
              }}
            />
            <span
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border bg-void px-3 py-0.5 font-display text-sm font-bold"
              style={{ borderColor: rank.color, color: rank.color }}
            >
              LV {profile.level}
            </span>
          </div>

          <h1 className="mt-6 text-center font-display text-3xl font-bold text-parchment">
            {profile.name ?? profile.login}
          </h1>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-gold"
          >
            @{profile.login}
          </a>

          <div className="mt-3 flex items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 font-display text-xs font-semibold"
              style={{ borderColor: bossClass.color, color: bossClass.color }}
            >
              {bossClass.name}
            </span>
            <span className="rounded-full border border-gold/40 px-3 py-1 font-display text-xs text-gold/90">
              Power {profile.overall}
            </span>
          </div>
          <p className="mt-2 text-center text-xs italic text-muted">
            {bossClass.blurb}
          </p>
        </div>

        {/* Right stats */}
        <div className="order-3 flex flex-col gap-5 md:order-none">
          {RIGHT.map((k) => (
            <StatBar
              key={k}
              statKey={k}
              label={STAT_LABELS[k]}
              value={stats[k]}
              align="right"
            />
          ))}
        </div>
      </div>

      {/* Facts */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>
          <span className="text-parchment">{profile.followers}</span> followers
        </span>
        <span>
          <span className="text-parchment">{profile.totalStars}</span> stars
        </span>
        <span>
          <span className="text-parchment">{profile.publicRepos}</span> repos
        </span>
        {profile.topLanguage && (
          <span>
            <span className="text-parchment">{profile.topLanguage}</span> soul
          </span>
        )}
        <span>
          <span className="text-parchment">{Math.floor(profile.years)}</span> yrs
          of ash
        </span>
      </div>

      <div className="rule mx-auto my-8 max-w-2xl" />

      {/* Lore */}
      <p className="mx-auto max-w-2xl text-center font-serif text-lg italic leading-relaxed text-parchment/80">
        {profile.lore}
      </p>

      {!profile.hasContributionData && (
        <p className="mt-6 text-center text-xs text-muted/70">
          Contribution stats are estimated — set a GITHUB_TOKEN for full power.
        </p>
      )}
    </div>
  );
}
