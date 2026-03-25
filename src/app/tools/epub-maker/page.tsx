"use client";

import { EpubMakerPageView, useEpubMaker } from "features/epub-maker";
import { getToolById, ToolDetailsSection } from "features/tools";
import { EpubHelpButton } from "features/epub-maker/components/EpubHelpButton";

export default function EpubMakerPage() {
  const epubMaker = useEpubMaker();
  const tool = getToolById("epub-maker");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} titleAction={<EpubHelpButton />} /> : null}
      <EpubMakerPageView {...epubMaker} />
    </>
  );
}
