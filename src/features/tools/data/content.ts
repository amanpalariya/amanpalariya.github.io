import type { ToolsHeaderConfig, ToolsPageContent } from "../types";

const TOOLS_PAGE_CONTENT: ToolsPageContent = {
  title: "Tools",
  subtitle: "Practical tools for creators and developers.",
  emptyStateTitle: "No tools found",
  emptyStateDescription:
    "Try changing the search text or filters. More tools will be added over time.",
  searchPlaceholder: "Search tools",
};

const TOOLS_HEADER_CONFIG: ToolsHeaderConfig = {
  productName: "Tools",
  productTagline: "Utility suite",
  homeHref: "/",
  showThemeToggle: true,
};

export function getToolsPageContent(): ToolsPageContent {
  return TOOLS_PAGE_CONTENT;
}

export function getToolHeaderConfig(): ToolsHeaderConfig {
  return TOOLS_HEADER_CONFIG;
}
