export type ToolCategory =
  | "conversion"
  | "text"
  | "media"
  | "dev"
  | "writing"
  | "experimental";

export type ToolStatus = "stable" | "beta" | "alpha" | "archived";

export interface ToolTag {
  id: string;
  label: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  tags: ToolTag[];
  path: string;
  searchText: string;
  sortOrder: number;
  updatedAt?: string;
  isFeatured?: boolean;
  icon?: string;
}

export interface ToolsPageContent {
  title: string;
  subtitle: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  searchPlaceholder: string;
}

export interface ToolFiltersState {
  query: string;
  category: "all" | ToolCategory;
  status: "all" | ToolStatus;
  featuredOnly: boolean;
}

export interface ToolSearchResult {
  tool: ToolDefinition;
  score: number;
  matchedFields: Array<"name" | "tagline" | "description" | "tags" | "category">;
}
