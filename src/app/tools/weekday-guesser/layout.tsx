import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { getToolById } from "features/tools/data/tools-registry";

const weekdayGuesserTool = getToolById("weekday-guesser");

export const metadata: Metadata = {
  title: getPageTitle(weekdayGuesserTool?.name ?? "Weekday Guesser"),
};

export default function WeekdayGuesserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
