import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { getToolById } from "features/tools/data/tools-registry";

const epubMakerTool = getToolById("epub-maker");

export const metadata: Metadata = {
  title: getPageTitle(epubMakerTool?.name ?? "EPUB Maker"),
};

export default function EpubMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}