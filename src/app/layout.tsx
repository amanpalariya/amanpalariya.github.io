import { Providers } from "./providers";
import { Metadata } from "next";
import { SITE_OWNER_NAME } from "./metadata";
import { Caveat, DM_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./navigation.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const handwritten = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-handwritten",
});

export const metadata: Metadata = {
  title: SITE_OWNER_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={"en"}
      className={`${dmSans.variable} ${handwritten.variable}`}
      suppressHydrationWarning
    >
      <head />
      <body
        className={dmSans.className}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
