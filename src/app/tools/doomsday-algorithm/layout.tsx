import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { getToolById } from "features/tools/data/tools-registry";

const doomsdayTool = getToolById("doomsday-algorithm");

export const metadata: Metadata = {
  title: getPageTitle(doomsdayTool?.name ?? "Doomsday Algorithm Trainer"),
};

export default function DoomsdayAlgorithmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
