import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import Backdrop from "@/components/Backdrop";
import SwordCursorInit from "@/components/SwordCursorInit";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gitsouls.com"),
  title: {
    default: "GitSouls",
    // Profile pages supply just the username, giving "GitSouls - <user>".
    template: "GitSouls - %s",
  },
  description:
    "GitSouls forges your GitHub profile into a Souls-like boss: stats, class, rank and lore, summoned in real time.",
  openGraph: {
    title: "GitSouls",
    description: "Turn your GitHub profile into a Souls-like boss.",
    siteName: "GitSouls",
    type: "website",
  },
  // No `icons` entry: App Router picks up src/app/icon.png automatically and
  // hashes its URL for cache-busting.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Backdrop />
        <SwordCursorInit />
        {children}
      </body>
    </html>
  );
}
