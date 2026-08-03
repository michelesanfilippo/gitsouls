import ScoutForm from "@/components/ScoutForm";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="animate-ember font-display text-xs uppercase tracking-[0.4em] text-ember">
          Bearer of the curse
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-wide text-parchment sm:text-7xl">
          GitSouls
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-parchment/70">
          Turn your GitHub profile into a Souls-like boss. Summon any warrior
          from the fog.
        </p>

        <div className="mt-10 flex w-full flex-col items-center">
          <ScoutForm />
          <p className="mt-4 text-xs text-muted">
            or swap{" "}
            <span className="text-parchment/60">github.com/</span>
            <span className="text-gold/70">username</span> for{" "}
            <span className="text-parchment/60">gitsouls.com/</span>
            <span className="text-gold/70">username</span>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
