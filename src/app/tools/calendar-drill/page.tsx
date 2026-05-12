"use client";

import { ClientOnly } from "@chakra-ui/react";
import { CalendarDrillPage } from "features/calendar-drill";
import { ToolDetailsSection, getToolById } from "features/tools";

export default function CalendarDrillToolPage() {
  const tool = getToolById("calendar-drill");

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <ClientOnly>
        <CalendarDrillPage />
      </ClientOnly>
    </>
  );
}
