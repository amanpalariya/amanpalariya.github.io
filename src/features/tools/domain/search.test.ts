import { describe, expect, it } from "vitest";
import type { ToolDefinition } from "../types";
import { buildToolSearchText, filterTools, rankTools } from "./search";

function tool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  const base: ToolDefinition = {
    id: "base",
    name: "Base Tool",
    tagline: "Baseline helper",
    description: "A generic test utility",
    status: "stable",
    tags: [{ id: "base", label: "Base" }],
    path: "/tools/base/",
    searchText: "",
    sortOrder: 10,
  };

  const merged = { ...base, ...overrides };
  return {
    ...merged,
    searchText: overrides.searchText ?? buildToolSearchText(merged),
  };
}

describe("buildToolSearchText", () => {
  it("normalizes all searchable tool fields into one lower-case string", () => {
    const result = buildToolSearchText(
      tool({
        name: "  EPUB Maker  ",
        tagline: "Convert HTML",
        description: "Build downloadable books",
        tags: [
          { id: "reader", label: "Reading Tools" },
          { id: "HTML", label: "Markup" },
        ],
      }),
    );

    expect(result).toBe(
      "epub maker convert html build downloadable books reader reading tools html markup",
    );
  });
});

describe("rankTools", () => {
  it("returns every tool with neutral scores when the query is blank", () => {
    const tools = [
      tool({ id: "b", name: "B Tool", sortOrder: 20 }),
      tool({ id: "a", name: "A Tool", sortOrder: 10 }),
    ];

    expect(rankTools(tools, "   ")).toEqual([
      { tool: tools[0], score: 1, matchedFields: [] },
      { tool: tools[1], score: 1, matchedFields: [] },
    ]);
  });

  it("scores direct name matches above tagline, description, tag, and fallback matches", () => {
    const tools = [
      tool({
        id: "description",
        name: "Writer",
        description: "Exports calendar notes",
        sortOrder: 1,
      }),
      tool({
        id: "tagline",
        name: "Practice",
        tagline: "Calendar repetition",
        sortOrder: 1,
      }),
      tool({
        id: "tag",
        name: "Trainer",
        tags: [{ id: "date", label: "Calendar" }],
        sortOrder: 1,
      }),
      tool({
        id: "name-start",
        name: "Calendar Drill",
        sortOrder: 99,
      }),
      tool({
        id: "name-contained",
        name: "Fast Calendar",
        sortOrder: 1,
      }),
      tool({
        id: "fallback",
        name: "Hidden",
        searchText: "calendar",
        sortOrder: 1,
      }),
    ];

    expect(rankTools(tools, "calendar").map((result) => result.tool.id)).toEqual([
      "name-start",
      "name-contained",
      "tagline",
      "description",
      "tag",
      "fallback",
    ]);
  });

  it("records every field that contributed to the match without duplicates", () => {
    const result = rankTools(
      [
        tool({
          name: "Calendar Calendar",
          tagline: "Calendar training",
          description: "Calendar quiz",
          tags: [
            { id: "calendar", label: "Calendar" },
            { id: "calendar", label: "Calendar" },
          ],
        }),
      ],
      "calendar",
    )[0];

    expect(result.matchedFields).toEqual([
      "name",
      "tagline",
      "description",
      "tags",
    ]);
  });

  it("uses sort order and then name as deterministic tie-breakers", () => {
    const tools = [
      tool({ id: "z", name: "Zulu", tagline: "PDF export", sortOrder: 20 }),
      tool({ id: "b", name: "Bravo", tagline: "PDF export", sortOrder: 10 }),
      tool({ id: "a", name: "Alpha", tagline: "PDF export", sortOrder: 10 }),
    ];

    expect(rankTools(tools, "pdf").map((result) => result.tool.id)).toEqual([
      "a",
      "b",
      "z",
    ]);
  });

  it("excludes tools that do not match the query", () => {
    const tools = [
      tool({ id: "match", name: "EPUB Maker" }),
      tool({ id: "miss", name: "Calendar Drill" }),
    ];

    expect(filterTools(tools, { query: "epub" }).map((result) => result.id)).toEqual([
      "match",
    ]);
  });
});
