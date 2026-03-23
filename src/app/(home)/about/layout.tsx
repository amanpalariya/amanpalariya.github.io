import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export const metadata: Metadata = {
  title: getPageTitle("About"),
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}