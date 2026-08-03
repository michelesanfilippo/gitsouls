import type { Skill } from "@/lib/scoring";

/** Bottom-right box listing the boss's unlocked skills. */
export default function SkillsBox({ skills }: { skills: Skill[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Skills · {skills.length}
      </p>
      <ul className="flex flex-col gap-2.5">
        {skills.map((s) => (
          <li key={s.name} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-base leading-none" aria-hidden>
              {s.icon}
            </span>
            <span>
              <span className="font-display text-sm font-semibold text-parchment">
                {s.name}
              </span>
              <span className="block text-xs italic text-muted">{s.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
