import Link from "next/link";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

/** Shown when a GitHub user cannot be found. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-ember">
          You Died
        </p>
        <h1 className="mt-4 font-display text-3xl text-parchment">
          No such warrior walks these lands
        </h1>
        <p className="mt-3 max-w-md text-parchment/70">
          That GitHub soul could not be summoned. Check the name and try again.
        </p>
        <Link
          href="/"
          className="mt-6 text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          Return to the fog
        </Link>
      </main>
      <Footer />
    </div>
  );
}
