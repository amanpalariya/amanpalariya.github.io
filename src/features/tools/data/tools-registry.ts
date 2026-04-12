import { buildToolSearchText } from "../domain/search";
import type { ToolDefinition } from "../types";

type ToolSeed = Omit<ToolDefinition, "searchText">;

const TOOL_SEEDS: ToolSeed[] = [
  {
    id: "weekday-guesser",
    name: "Weekday Guesser",
    tagline: "Guess the weekday for random dates",
    description: "Guess weekdays for random dates.",
    category: "experimental",
    status: "beta",
    tags: [
      { id: "calendar", label: "Calendar Math" },
      { id: "mental-math", label: "Mental Math" },
    ],
    path: "/tools/weekday-guesser/",
    sortOrder: 8,
    icon: "calendar",
    updatedAt: "2026-04-05",
  },
  {
    id: "epub-maker",
    name: "EPUB Maker",
    tagline: "Convert pasted HTML, text, or images into clean EPUB files",
    description:
      "Paste HTML pages, plain text, or images, reorder chapters, set metadata, and generate a downloadable EPUB.",
    category: "conversion",
    status: "beta",
    tags: [{ id: "epub", label: "EPUB" }],
    path: "/tools/epub-maker/",
    sortOrder: 10,
    isFeatured: true,
    icon: "book",
    updatedAt: "2026-03-22",
  },
];

const TOOLS: ToolDefinition[] = TOOL_SEEDS.map((seed) => {
  const tool = {
    ...seed,
    searchText: "",
  } as ToolDefinition;

  return {
    ...tool,
    searchText: buildToolSearchText(tool),
  };
}).sort((a, b) => a.sortOrder - b.sortOrder);

export function getAllTools(): ToolDefinition[] {
  return TOOLS;
}

export function getToolById(id: string): ToolDefinition | null {
  return TOOLS.find((tool) => tool.id === id) ?? null;
}
