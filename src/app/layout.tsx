import { Providers } from "./providers";
import { Metadata } from "next";
import { SITE_OWNER_NAME } from "./metadata";
import { Lexend, Noto_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "computer-modern/index.css";

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
      <body className={`${lexend.variable} ${notoSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
