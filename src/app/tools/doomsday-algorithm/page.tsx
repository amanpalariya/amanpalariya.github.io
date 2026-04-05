"use client";

import { DoomsdayTrainerPage } from "features/doomsday-trainer";
import { ToolDetailsSection, getToolById } from "features/tools";

export default function DoomsdayAlgorithmPage() {
  const tool = getToolById("doomsday-algorithm");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <DoomsdayTrainerPage />
    </>
  );
}
