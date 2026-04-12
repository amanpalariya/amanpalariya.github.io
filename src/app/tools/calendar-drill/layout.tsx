import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { getToolById } from "features/tools/data/tools-registry";

const calendarDrillTool = getToolById("calendar-drill");

export const metadata: Metadata = {
  title: getPageTitle(calendarDrillTool?.name ?? "Calendar Drill"),
};

export default function CalendarDrillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
