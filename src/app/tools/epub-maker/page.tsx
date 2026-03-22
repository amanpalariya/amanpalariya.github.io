"use client";

import { EpubMakerPageView, useEpubMaker } from "features/epub-maker";
import { getToolById, ToolDetailsSection } from "features/tools";

export default function EpubMakerPage() {
  const epubMaker = useEpubMaker();
  const tool = getToolById("epub-maker");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <EpubMakerPageView {...epubMaker} />
    </>
  );
}
