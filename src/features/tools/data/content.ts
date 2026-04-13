import type { ToolsPageContent } from "../types";

const TOOLS_PAGE_CONTENT: ToolsPageContent = {
  title: "Tools",
  subtitle: "Practical tools for creators and developers.",
  emptyStateTitle: "No tools found",
  emptyStateDescription:
    "Try changing the search text. More tools will be added over time.",
  searchPlaceholder: "Search tools",
};

export function getToolsPageContent(): ToolsPageContent {
  return TOOLS_PAGE_CONTENT;
}
