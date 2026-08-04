/**
 * Shared atmospheric backdrop: drifting ember/gold orbs plus a field of
 * twinkling stars. Fixed behind all content. Star positions are generated
 * deterministically so server and client markup match (no hydration drift).
 *
 * Every soft edge here is a radial-gradient, never a `blur()` filter, and the
 * only animated property is `opacity`. That combination is deliberate: a large
 * blur on a transform-animated element forces the browser to re-rasterise the
 * blurred bitmap every frame, and under memory pressure it ships partially
 * painted tiles — which is what produced the flickering black hairlines. A
 * gradient is painted once and `opacity` is composited on the GPU, so there is
 * nothing left to re-rasterise. `closest-side` also guarantees the gradient
 * reaches full transparency exactly at the element's edge, so no seam can form.
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
  return Array.from({ length: 55 }, () => ({
    top: rand() * 100,
    left: rand() * 100,
    size: 1 + rand() * 2,
    delay: rand() * 5,
    duration: 2.5 + rand() * 4,
  }));
})();

/** A soft, gradient-based glow. No blur filter, so nothing re-rasterises. */
function Glow({
  className,
  color,
  delay,
  animation = "animate-glow",
}: {
  className: string;
  color: string;
  delay?: string;
  animation?: string;
}) {
  return (
    <div
      className={`${animation} absolute ${className}`}
      style={{
        backgroundImage: `radial-gradient(closest-side, ${color}, transparent)`,
        animationDelay: delay,
      }}
    />
  );
}

export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Ember and gold orbs */}
      <Glow
        className="-top-40 left-[18%] h-[38rem] w-[38rem]"
        color="rgba(220,38,38,0.20)"
      />
      <Glow
        className="-bottom-52 right-[16%] h-[40rem] w-[40rem]"
        color="rgba(212,175,55,0.14)"
        delay="7s"
      />
      <Glow
        className="left-[6%] top-1/2 h-[30rem] w-[30rem]"
        color="rgba(26,16,42,0.65)"
        delay="3.5s"
      />

      {/* Rolling fog banks */}
      <Glow
        className="-bottom-[22vh] -left-[15%] h-[70vh] w-[130%]"
        color="rgba(178,178,205,0.14)"
        animation="animate-fog-drift"
      />
      <Glow
        className="-left-[25%] top-[18%] h-[50vh] w-[115%]"
        color="rgba(158,158,190,0.10)"
        animation="animate-fog-drift-slow"
      />
      <Glow
        className="-right-[20%] top-[48%] h-[45vh] w-[100%]"
        color="rgba(150,150,185,0.08)"
        animation="animate-fog-drift"
        delay="11s"
      />

      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-parchment"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/*
        Depth at the top and bottom only. A centred ellipse reads as a frame
        around the page: anchored to a fixed backdrop, its dark ring stays put
        while the content scrolls past it.
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),transparent_28%,transparent_72%,rgba(0,0,0,0.35))]" />
    </div>
  );
}
