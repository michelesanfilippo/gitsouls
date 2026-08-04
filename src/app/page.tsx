import Image from "next/image";
import ScoutForm from "@/components/ScoutForm";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import EngravedTitle from "@/components/EngravedTitle";
import SwordCursor from "@/components/SwordCursor";
import SoulsCounter from "@/components/SoulsCounter";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Floating OctoSouls, left at title height */}
        <div className="animate-float-slow pointer-events-none absolute left-[4%] top-[38%] hidden -translate-y-1/2 lg:block xl:left-[9%]">
          <Image
            src="/img/octoSouls-nobg.png"
            alt="OctoSouls"
            width={495}
            height={504}
            priority
            className="h-auto w-72 opacity-90 xl:w-[22rem]"
          />
        </div>

        {/* Floating sword, right and a little below the search box */}
        <div className="absolute right-[6%] top-[68%] hidden -translate-y-1/2 lg:block xl:right-[12%]">
          <SwordCursor />
        </div>

        <EngravedTitle pulse className="text-lg tracking-[0.45em] sm:text-2xl">
          Bearer of the Curse
        </EngravedTitle>

        <h1 className="mt-5 font-display text-6xl font-bold tracking-wide text-parchment sm:text-8xl">
          GitSouls
        </h1>
        <p className="mt-5 max-w-xl font-serif text-xl text-parchment/75 sm:text-2xl">
          Turn your github profile into a Souls-like boss.
        </p>

        <div className="mt-10 flex w-full flex-col items-center">
          <ScoutForm />
          <SoulsCounter />
        </div>
      </main>
      <Footer />
    </div>
  );
}
