import { buildToolSearchText } from "../domain/search";
import type { ToolDefinition } from "../types";

type ToolSeed = Omit<ToolDefinition, "searchText">;

const TOOL_SEEDS: ToolSeed[] = [
  {
    id: "calendar-drill",
    name: "Calendar Drill",
    tagline: "Practice weekdays for random dates",
    description: "Guess weekdays for random dates.",
    status: "stable",
    tags: [
      { id: "calendar", label: "Calendar" },
      { id: "math", label: "Math" },
    ],
    path: "/tools/calendar-drill/",
    sortOrder: 8,
    icon: "calendar",
    updatedAt: "2026-04-05",
  },
  {
    id: "bilingual-story-reader",
    name: "Bilingual Story Reader",
    tagline: "Generate and read bilingual AI stories",
    description:
      "Build a language-learning story prompt, paste the AI response, and read with local sentence translations and notes.",
    status: "beta",
    tags: [
      { id: "language", label: "Language" },
      { id: "reading", label: "Reading" },
    ],
    path: "/tools/bilingual-story-reader/",
    sortOrder: 9,
    icon: "book",
    updatedAt: "2026-05-16",
  },
  {
    id: "epub-maker",
    name: "EPUB Maker",
    tagline: "Convert pasted HTML, text, or images into clean EPUB files",
    description:
      "Paste HTML pages, plain text, or images, reorder chapters, set metadata, and generate a downloadable EPUB.",
    status: "stable",
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
