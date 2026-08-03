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
    default: "GitSouls — Turn your profile into a Souls-like boss",
    template: "%s — GitSouls",
  },
  description:
    "GitSouls forges your GitHub profile into a Souls-like boss: stats, class, rank and lore, summoned in real time.",
  openGraph: {
    title: "GitSouls",
    description: "Turn your GitHub profile into a Souls-like boss.",
    siteName: "GitSouls",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
