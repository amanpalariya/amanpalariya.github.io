import { Providers } from "./providers";
import { Metadata } from "next";
import { SITE_OWNER_NAME } from "./metadata";
import "katex/dist/katex.min.css";
import "@fontsource/lexend";
import "@fontsource/noto-sans";
import "computer-modern/index.css";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
