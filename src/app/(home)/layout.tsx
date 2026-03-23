import CommonHeader from "./CommonHeader";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export const metadata: Metadata = {
  title: getPageTitle("Home"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommonHeader>{children}</CommonHeader>;
}
