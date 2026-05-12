"use client";

import { ClientOnly } from "@chakra-ui/react";
import { EpubMakerPageView, useEpubMaker } from "features/epub-maker";
import { getToolById, ToolDetailsSection } from "features/tools";
import { EpubHelpButton } from "features/epub-maker/components/EpubHelpButton";

function EpubMakerClientEditor() {
  const epubMaker = useEpubMaker();

  return <EpubMakerPageView {...epubMaker} />;
}

export default function EpubMakerPage() {
  const tool = getToolById("epub-maker");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} titleAction={<EpubHelpButton />} /> : null}
      <ClientOnly>
        <EpubMakerClientEditor />
      </ClientOnly>
    </>
  );
}
