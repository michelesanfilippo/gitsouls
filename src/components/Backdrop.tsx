/**
 * Shared atmospheric backdrop: drifting ember/gold orbs plus a field of
 * twinkling stars. Fixed behind all content. Star positions are generated
 * deterministically so server and client markup match (no hydration drift).
 */

interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

// Deterministic pseudo-random star field (seeded LCG).
const STARS: Star[] = (() => {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return Array.from({ length: 70 }, () => ({
    top: rand() * 100,
    left: rand() * 100,
    size: 1 + rand() * 2,
    delay: rand() * 5,
    duration: 2.5 + rand() * 4,
  }));
})();

export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Drifting glass orbs */}
      <div className="animate-drift absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-ember/20 blur-[120px]" />
      <div
        className="animate-drift absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-gold/15 blur-[130px]"
        style={{ animationDelay: "6s" }}
      />
      <div
        className="animate-drift absolute left-[10%] top-1/2 h-72 w-72 rounded-full bg-void-2/60 blur-[110px]"
        style={{ animationDelay: "3s" }}
      />

      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star animate-ember absolute rounded-full bg-parchment"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 6px rgba(232,224,207,0.8)",
          }}
        />
      ))}

      {/* Rolling fog — low-lying mist and a mid-height drift */}
      <div
        className="animate-fog-drift absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(170,170,195,0.1), transparent 70%)",
        }}
      />
      <div
        className="animate-fog-drift-slow absolute inset-x-0 top-1/4 h-[40vh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 30% 50%, rgba(150,150,180,0.06), transparent 65%)",
        }}
      />

      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
