"use client";

import { EpubMakerPageView, useEpubMaker } from "features/epub-maker";
import { getToolById, ToolPageHeader } from "features/tools";

export default function EpubMakerPage() {
  const epubMaker = useEpubMaker();
  const tool = getToolById("epub-maker");

  return (
    <>
      {tool ? <ToolPageHeader tool={tool} /> : null}
      <EpubMakerPageView {...epubMaker} />
    </>
  );
}
