"use client";

import { WeekdayGuesserPage } from "features/doomsday-trainer";
import { ToolDetailsSection, getToolById } from "features/tools";

export default function WeekdayGuesserToolPage() {
  const tool = getToolById("weekday-guesser");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <WeekdayGuesserPage />
    </>
  );
}
