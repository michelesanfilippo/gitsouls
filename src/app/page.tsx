import Image from "next/image";
import ScoutForm from "@/components/ScoutForm";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import EngravedTitle from "@/components/EngravedTitle";
import SwordCursor from "@/components/SwordCursor";
import LandingStatus from "@/components/LandingStatus";
import SupportButton from "@/components/SupportButton";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar hideHowItWorks />
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pt-10 text-center sm:pt-0">
        {/* Floating OctoSouls, left at title height */}
        <div className="animate-float-slow pointer-events-none absolute left-[4%] top-[38%] hidden -translate-y-1/2 lg:block xl:left-[9%]">
          <Image
            src="/img/octoSouls-nobg.png"
            alt="OctoSouls"
            width={495}
            height={504}
            priority
            className="h-auto w-80 opacity-90 xl:w-[25rem]"
          />
        </div>

        {/* Floating sword, right and a little below the search box */}
        <div className="absolute right-[6%] top-[60%] hidden -translate-y-1/2 lg:block xl:right-[12%]">
          <SwordCursor />
        </div>

        {/* Small gitOcto shown only on mobile, above the text */}
        <div className="mb-4 block sm:hidden">
          <Image
            src="/img/octoSouls-nobg.png"
            alt=""
            aria-hidden
            width={495}
            height={504}
            className="h-auto w-36 opacity-80"
          />
        </div>

        <EngravedTitle lit className="text-lg tracking-[0.45em] sm:text-2xl">
          Bearer of the Curse
        </EngravedTitle>

        <h1 className="mt-5 font-display text-6xl font-bold tracking-wide text-parchment sm:text-8xl">
          Git<span className="text-gold/80">Souls</span>
        </h1>
        <p className="mt-5 max-w-xl font-serif text-xl text-parchment/75 sm:text-2xl">
          Your github profile turned into a Souls-like boss
        </p>

        <div className="mt-10 flex w-full flex-col items-center">
          <ScoutForm />
          <LandingStatus />
        </div>
      </main>
      <Footer />

      {/* Fixed so it holds the bottom-right corner regardless of page height.
          Hidden on small screens, where it would crowd the footer. */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-30 block">
        <div className="pointer-events-auto">
          <SupportButton />
        </div>
      </div>
    </div>
  );
}
