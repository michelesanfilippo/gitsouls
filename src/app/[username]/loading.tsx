import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

/** Summoning screen shown while the boss profile is being forged. */
export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="h-44 w-44 animate-ember rounded-full border-4 border-gold/40 bg-black/30 shadow-[0_0_55px_rgba(212,175,55,0.25)]" />
        <p className="mt-8 animate-ember font-display text-sm uppercase tracking-[0.35em] text-gold">
          Summoning…
        </p>
      </main>
      <Footer />
    </div>
  );
}
