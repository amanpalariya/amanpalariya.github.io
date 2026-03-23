import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";

export const metadata: Metadata = {
  title: getPageTitle(homepageTabs.cv.name),
};

export default function CvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}