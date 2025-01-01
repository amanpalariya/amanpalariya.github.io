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
    <html lang={"en"} suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
