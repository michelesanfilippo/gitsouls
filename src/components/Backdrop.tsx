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
      className="gpu-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Drifting glass orbs */}
      <div className="animate-drift gpu-layer absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-ember/20 blur-[120px]" />
      <div
        className="animate-drift gpu-layer absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-gold/15 blur-[130px]"
        style={{ animationDelay: "6s" }}
      />
      <div
        className="animate-drift gpu-layer absolute left-[10%] top-1/2 h-72 w-72 rounded-full bg-void-2/60 blur-[110px]"
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

      {/*
        Rolling fog. Deliberately blurred, over-sized blobs with rounded-[50%]:
        a rectangular element carrying a radial-gradient shows a hard seam
        wherever the gradient is still opaque when it meets the element's edge,
        which reads as a box outline. Blur + generous overflow avoids that.

        gpu-layer promotes each blob to its own compositor layer: animating a
        transform on a heavily blurred element inside an overflow-hidden parent
        otherwise makes the clip edge re-rasterise every frame, which flickers
        as a thin dark line.
      */}
      <div className="animate-fog-drift gpu-layer absolute -bottom-[18vh] -left-[10%] h-[65vh] w-[130%] rounded-[50%] bg-[rgba(178,178,205,0.13)] blur-[90px]" />
      <div className="animate-fog-drift-slow gpu-layer absolute -left-[20%] top-[22%] h-[45vh] w-[110%] rounded-[50%] bg-[rgba(158,158,190,0.09)] blur-[100px]" />
      <div
        className="animate-fog-drift gpu-layer absolute -right-[15%] top-[52%] h-[40vh] w-[95%] rounded-[50%] bg-[rgba(150,150,185,0.07)] blur-[110px]"
        style={{ animationDelay: "9s" }}
      />

      {/*
        Vignette. Inset beyond the viewport on every side so its darkest ring
        falls outside the visible area: anchored flush to a fixed backdrop it
        reads as a frame around the page while the content scrolls past it.
      */}
      <div className="absolute -inset-[15%] bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
