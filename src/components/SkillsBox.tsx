import type { Skill } from "@/lib/scoring";
import Tooltip from "./Tooltip";

/** Box listing the boss's unlocked skills, each explaining how it was earned. */
export default function SkillsBox({ skills }: { skills: Skill[] }) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Skills
      </p>
      <ul className="flex flex-col gap-2.5">
        {skills.map((s) => (
          <li key={s.name} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-base leading-none" aria-hidden>
              {s.icon}
            </span>
            <Tooltip
              content={
                <>
                  <span className="block font-display text-xs uppercase tracking-[0.2em] text-gold">
                    {s.name}
                  </span>
                  <span className="mt-1.5 block text-xs text-parchment/75">
                    {s.note}
                  </span>
                  <span className="mt-2 block text-[11px] italic text-muted">
                    {s.how}
                  </span>
                </>
              }
            >
              <button
                type="button"
                aria-label={`How ${s.name} is earned`}
                className="souls-focus cursor-help rounded-sm text-left"
              >
                <span className="font-display text-sm font-semibold text-parchment decoration-gold/30 decoration-dotted underline-offset-4 hover:underline">
                  {s.name}
                </span>
                <span className="block text-xs italic text-muted">{s.note}</span>
              </button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}
