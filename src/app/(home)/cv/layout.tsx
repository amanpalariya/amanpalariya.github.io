import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export const metadata: Metadata = {
  title: getPageTitle("CV"),
};

export default function CvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}