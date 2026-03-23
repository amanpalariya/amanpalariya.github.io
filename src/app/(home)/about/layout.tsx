import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";

export const metadata: Metadata = {
  title: getPageTitle(homepageTabs.about.name),
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}