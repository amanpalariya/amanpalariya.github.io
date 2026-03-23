import CommonHeader from "./CommonHeader";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";

export const metadata: Metadata = {
  title: getPageTitle(homepageTabs.home.name),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommonHeader>{children}</CommonHeader>;
}
