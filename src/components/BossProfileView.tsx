import Image from "next/image";
import type { BossProfile } from "@/lib/profile";
import { STAT_LABELS, type StatKey } from "@/lib/scoring/types";
import StatBar from "./StatBar";
import ShareBox from "./ShareBox";
import SkillsBox from "./SkillsBox";
import PercentileBox from "./PercentileBox";
import LanguageIcon from "./LanguageIcon";

const LEFT: StatKey[] = ["VIT", "END", "INT"];
const RIGHT: StatKey[] = ["DEX", "FAI", "SOP"];

/**
 * Full boss layout. Two side columns flank the avatar: each carries its three
 * stats with a box beneath (share on the left, skills on the right), so the
 * page fills out without the lore leaving a dead band across the middle.
 */
export default function BossProfileView({ profile }: { profile: BossProfile }) {
  const { rank, bossClass, stats } = profile;

  return (
    <div className="animate-fade-up relative flex w-full flex-1 flex-col justify-center gap-8 px-4 py-6 sm:px-8 lg:px-12">
      {/*
        Three columns, each a flow of its own: stats then that column's box, so
        every box sits directly beneath its stats. `items-start` keeps the columns
        from stretching, which is what previously let a tall skills list drag the
        opposite box out of line.
      */}
      <div className="grid grid-cols-1 items-start gap-x-10 gap-y-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-14">
        {/* Left — stats, then the share box */}
        <div className="order-2 flex w-full flex-col gap-6 md:order-none md:ml-auto md:max-w-sm md:pt-28 lg:max-w-md">
          {LEFT.map((k) => (
            <StatBar
              key={k}
              statKey={k}
              label={STAT_LABELS[k]}
              value={stats[k]}
            />
          ))}
          <ShareBox login={profile.login} name={profile.name ?? profile.login} />
        </div>

        {/* Avatar */}
        <div className="order-1 flex flex-col items-center md:order-none">
          <span
            className="mb-2 font-display text-2xl uppercase tracking-[0.35em] sm:text-3xl"
            style={{
              color: rank.color,
              textShadow: `0 0 22px ${rank.glow}, 0 2px 4px rgba(0,0,0,0.85)`,
            }}
          >
            {rank.name}
          </span>

          <div className="relative">
            <div
              className="relative overflow-hidden rounded-full"
              style={{
                border: `6px solid ${rank.color}`,
                boxShadow: `0 0 80px ${rank.glow}, 0 0 30px ${rank.color}, inset 0 0 25px rgba(0,0,0,0.7)`,
              }}
            >
              <Image
                src={profile.avatarUrl}
                alt={`${profile.login} avatar`}
                width={220}
                height={220}
                priority
                className="h-40 w-40 object-cover sm:h-44 sm:w-44"
              />
              {/* Fog over the portrait. No mix-blend-mode and no animated
                  transform: blending forces the portrait beneath to be
                  re-composited every frame. Opacity alone is free. */}
              <div
                className="animate-fog pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 70%, rgba(216,216,236,0.30), transparent 55%), radial-gradient(circle at 70% 40%, rgba(196,196,220,0.22), transparent 50%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-30px_50px_rgba(0,0,0,0.75)]" />
            </div>

            <span
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border bg-void px-3 py-0.5 font-display text-sm font-bold"
              style={{ borderColor: rank.color, color: rank.color }}
            >
              LV {profile.level}
            </span>
          </div>

          <h1 className="mt-6 text-center font-display text-2xl font-bold text-parchment sm:text-3xl">
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

          {/* Class, with the top language alongside it */}
          <div className="mt-3 flex items-center gap-3">
            <span
              className="rounded-xl border-2 px-3 py-1.5 font-display text-base font-semibold uppercase tracking-[0.2em] sm:text-lg"
              style={{
                color: bossClass.color,
                borderColor: bossClass.color,
                backgroundColor: `${bossClass.color}15`,
                textShadow: `0 0 18px ${bossClass.color}55, 0 2px 4px rgba(0,0,0,0.6)`,
                boxShadow: `0 0 20px ${bossClass.color}30`,
              }}
            >
              {bossClass.name}
            </span>
            {profile.topLanguage && (
              <LanguageIcon language={profile.topLanguage} color={rank.color} />
            )}
          </div>

          <p className="mt-2 max-w-xs text-center text-sm italic text-muted">
            {bossClass.blurb}
          </p>

          {/* Facts */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <span>
              <span className="text-parchment">{profile.followers}</span>{" "}
              followers
            </span>
            <span>
              <span className="text-parchment">{profile.totalStars}</span> stars
            </span>
            <span>
              <span className="text-parchment">{profile.publicRepos}</span> repos
            </span>
            <span>
              <span className="text-parchment">{Math.floor(profile.years)}</span>{" "}
              yrs of ash
            </span>
          </div>

          <div className="mt-5 w-full max-w-[15rem]">
            <PercentileBox rankInfo={profile.rankInfo} color={rank.color} />
          </div>
        </div>

        {/* Right — stats, then the skills box. Wider than the left column so a
            long skills list spills into extra columns rather than growing tall. */}
        <div className="order-3 flex w-full flex-col gap-6 md:order-none md:mr-auto md:max-w-md md:pt-28 lg:max-w-lg">
          {RIGHT.map((k) => (
            <StatBar
              key={k}
              statKey={k}
              label={STAT_LABELS[k]}
              value={stats[k]}
              align="right"
            />
          ))}
          <SkillsBox skills={profile.skills} />
        </div>
      </div>

      {/* Lore */}
      <div className="flex flex-col items-center text-center">
        <p className="mx-auto max-w-2xl font-serif text-base italic leading-relaxed text-parchment/80 sm:text-lg">
          {profile.lore}
        </p>
        {!profile.hasContributionData && (
          <p className="mt-4 text-xs text-muted/70">
            Contribution stats are estimated — set a GITHUB_TOKEN for full power.
          </p>
        )}
      </div>
    </div>
  );
}
