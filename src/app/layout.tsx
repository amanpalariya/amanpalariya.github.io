import { Providers } from "./providers";
import { Metadata } from "next";
import { SITE_OWNER_NAME } from "./metadata";
import { Caveat, Lexend, Noto_Sans, Source_Serif_4 } from "next/font/google";
import "katex/dist/katex.min.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lexend",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-serif",
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
    <html lang={"en"} suppressHydrationWarning>
      <head />
      <body
        className={`${notoSans.className} ${lexend.variable} ${notoSans.variable} ${sourceSerif.variable} ${handwritten.variable}`}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
