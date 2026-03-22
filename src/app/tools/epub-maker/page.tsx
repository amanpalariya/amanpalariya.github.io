"use client";

import { EpubMakerPageView, useEpubMaker } from "features/epub-maker";

export default function EpubMakerPage() {
  const epubMaker = useEpubMaker();
  return <EpubMakerPageView {...epubMaker} />;
}
