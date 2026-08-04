import type { Skill } from "@/lib/scoring";
import Tooltip from "./Tooltip";
import Icon from "./Icon";

/** Max skills per column before spilling into another one. */
const PER_COLUMN = 4;

/** Split into columns of at most PER_COLUMN, so a long list grows sideways. */
function toColumns(skills: Skill[]): Skill[][] {
  const columns: Skill[][] = [];
  for (let i = 0; i < skills.length; i += PER_COLUMN) {
    columns.push(skills.slice(i, i + PER_COLUMN));
  }
  return columns;
}

/** Box listing the boss's unlocked skills, each explaining how it was earned. */
export default function SkillsBox({ skills }: { skills: Skill[] }) {
  const columns = toColumns(skills);

  return (
    <div className="glass-soft rounded-2xl p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-gold/80">
        Skills
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {columns.map((column, i) => (
          <ul key={i} className="flex min-w-[11rem] flex-1 flex-col gap-2.5">
            {column.map((s) => (
              <li key={s.name} className="flex items-start gap-2.5">
                <Icon
                  name={s.icon}
                  className="mt-0.5 h-5 w-5 shrink-0 text-gold/70"
                />
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
                    <span className="font-display text-base font-semibold text-parchment decoration-gold/30 decoration-dotted underline-offset-4 hover:underline">
                      {s.name}
                    </span>
                    <span className="block text-sm italic text-muted">
                      {s.note}
                    </span>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
