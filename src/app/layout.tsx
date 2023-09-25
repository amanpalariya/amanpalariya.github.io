import { ColorModeScript, SlideFade } from "@chakra-ui/react";
import { Providers } from "./providers";
import { Metadata } from "next";
import { PersonalData } from "data";

export const metadata: Metadata = {
  title: `${PersonalData.name.full} | Website`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head />
      <body>
        <Providers>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript />
          {children}
        </Providers>
      </body>
    </html>
  );
}
