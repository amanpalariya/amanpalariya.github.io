import type {
  ToolCategory,
  ToolDefinition,
  ToolFiltersState,
  ToolSearchResult,
} from "../types";

const SEARCHABLE_SEPARATOR = " ";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function buildToolSearchText(tool: ToolDefinition): string {
  return normalize(
    [
      tool.name,
      tool.tagline,
      tool.description,
      tool.category,
      tool.status,
      ...tool.tags.map((tag) => `${tag.id} ${tag.label}`),
    ].join(SEARCHABLE_SEPARATOR),
  );
}

export function rankTools(tools: ToolDefinition[], query: string): ToolSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return tools.map((tool) => ({
      tool,
      score: 1,
      matchedFields: [],
    }));
  }

  return tools
    .map((tool) => {
      const fields: ToolSearchResult["matchedFields"] = [];
      let score = 0;

      const name = normalize(tool.name);
      const tagline = normalize(tool.tagline);
      const description = normalize(tool.description);
      const category = normalize(tool.category);
      const tags = tool.tags.map((tag) => normalize(`${tag.id} ${tag.label}`));

      if (name.includes(normalizedQuery)) {
        fields.push("name");
        score += name.startsWith(normalizedQuery) ? 8 : 6;
      }

      if (tagline.includes(normalizedQuery)) {
        fields.push("tagline");
        score += 4;
      }

      if (description.includes(normalizedQuery)) {
        fields.push("description");
        score += 3;
      }

      if (category.includes(normalizedQuery)) {
        fields.push("category");
        score += 2;
      }

      if (tags.some((tag) => tag.includes(normalizedQuery))) {
        fields.push("tags");
        score += 2;
      }

      if (score === 0 && tool.searchText.includes(normalizedQuery)) {
        score = 1;
      }

      return {
        tool,
        score,
        matchedFields: Array.from(new Set(fields)),
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.tool.sortOrder !== b.tool.sortOrder) return a.tool.sortOrder - b.tool.sortOrder;
      return a.tool.name.localeCompare(b.tool.name);
    });
}

export function filterTools(
  tools: ToolDefinition[],
  filters: ToolFiltersState,
): ToolDefinition[] {
  const ranked = rankTools(tools, filters.query).map((result) => result.tool);

  return ranked.filter((tool) => {
    if (filters.category !== "all" && tool.category !== filters.category) {
      return false;
    }

    if (filters.status !== "all" && tool.status !== filters.status) {
      return false;
    }

    if (filters.featuredOnly && !tool.isFeatured) {
      return false;
    }

    return true;
  });
}

export function groupToolsByCategory(
  tools: ToolDefinition[],
): Record<ToolCategory, ToolDefinition[]> {
  const groups: Record<ToolCategory, ToolDefinition[]> = {
    conversion: [],
    text: [],
    media: [],
    dev: [],
    writing: [],
    experimental: [],
  };

  for (const tool of tools) {
    groups[tool.category].push(tool);
  }

  return groups;
}
