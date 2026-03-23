import type { Metadata } from "next";
import ToolsShell from "./ToolsShell";
import { getPageTitle } from "app/metadata";
import { getToolsPageContent } from "features/tools/data/content";

const toolsPageContent = getToolsPageContent();

export const metadata: Metadata = {
  title: getPageTitle(toolsPageContent.title),
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolsShell>{children}</ToolsShell>;
}