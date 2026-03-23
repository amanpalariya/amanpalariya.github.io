import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export const metadata: Metadata = {
  title: getPageTitle("EPUB Maker"),
};

export default function EpubMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}