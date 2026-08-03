import Image from "next/image";
import Link from "next/link";
import type { BossProfile } from "@/lib/profile";
import { STAT_LABELS, type StatKey } from "@/lib/scoring/types";
import StatBar from "./StatBar";
import ShareBox from "./ShareBox";
import SkillsBox from "./SkillsBox";
import RankPopup from "./RankPopup";
import LanguageIcon from "./LanguageIcon";

const LEFT: StatKey[] = ["VIT", "END", "INT"];
const RIGHT: StatKey[] = ["DEX", "FAI", "SOP"];

/** Full boss layout: stats flank a fog-shrouded avatar, lore flanked by boxes. */
export default function BossProfileView({ profile }: { profile: BossProfile }) {
  const { rank, bossClass, stats } = profile;

  return (
    <div className="animate-fade-up relative mx-auto w-full max-w-6xl px-4 py-4">
      {/* Back — top-left of the page */}
      <Link
        href="/"
        className="souls-focus absolute left-4 top-0 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gold/25 bg-void-2/50 px-3 py-1.5 font-display text-sm text-parchment/80 backdrop-blur transition-colors hover:border-gold/60 hover:text-gold"
      >
        <span aria-hidden>←</span> Back
      </Link>

      <div className="mt-10 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left stats */}
        <div className="order-2 flex flex-col gap-4 md:order-none">
          {LEFT.map((k) => (
            <StatBar key={k} statKey={k} label={STAT_LABELS[k]} value={stats[k]} />
          ))}
        </div>

        {/* Avatar */}
        <div className="order-1 flex flex-col items-center md:order-none">
          <span
            className="emboss mb-2 font-display text-2xl uppercase tracking-[0.35em] sm:text-3xl"
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
              {/* Fog overlay */}
              <div
                className="animate-fog pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 70%, rgba(200,200,220,0.35), transparent 55%), radial-gradient(circle at 70% 40%, rgba(180,180,200,0.25), transparent 50%)",
                  mixBlendMode: "screen",
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

          <span
            className="mt-3 font-display text-xl font-semibold uppercase tracking-[0.2em] sm:text-2xl"
            style={{
              color: bossClass.color,
              textShadow: `0 0 18px ${bossClass.color}55, 0 2px 4px rgba(0,0,0,0.6)`,
            }}
          >
            {bossClass.name}
          </span>

          {profile.topLanguage && (
            <div className="mt-3">
              <LanguageIcon language={profile.topLanguage} color={rank.color} />
            </div>
          )}
          <p className="mt-2 max-w-xs text-center text-sm italic text-muted">
            {bossClass.blurb}
          </p>
        </div>

        {/* Right stats */}
        <div className="order-3 flex flex-col gap-4 md:order-none">
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
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-base text-muted">
        <span>
          <span className="text-parchment">{profile.followers}</span> followers
        </span>
        <span>
          <span className="text-parchment">{profile.totalStars}</span> stars
        </span>
        <span>
          <span className="text-parchment">{profile.publicRepos}</span> repos
        </span>
        <span>
          <span className="text-parchment">{Math.floor(profile.years)}</span> yrs
          of ash
        </span>
      </div>

      {/* Share (left) · Lore (center) · Skills (right) */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="order-2 lg:order-none">
          <ShareBox login={profile.login} name={profile.name ?? profile.login} />
        </div>

        <div className="order-1 flex flex-col items-center justify-center text-center lg:order-none">
          <div className="rule mx-auto mb-4 w-24" />
          <p className="font-serif text-base italic leading-relaxed text-parchment/80">
            {profile.lore}
          </p>
          {!profile.hasContributionData && (
            <p className="mt-4 text-xs text-muted/70">
              Contribution stats are estimated — set a GITHUB_TOKEN for full power.
            </p>
          )}
        </div>

        <div className="order-3 flex flex-col items-end gap-3 lg:order-none">
          <SkillsBox skills={profile.skills} />
          <RankPopup rankInfo={profile.rankInfo} color={rank.color} />
        </div>
      </div>
    </div>
  );
}
