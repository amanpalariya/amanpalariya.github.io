"use client";

import { CalendarDrillPage } from "features/doomsday-trainer";
import { ToolDetailsSection, getToolById } from "features/tools";

export default function CalendarDrillToolPage() {
  const tool = getToolById("calendar-drill");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <CalendarDrillPage />
    </>
  );
}
