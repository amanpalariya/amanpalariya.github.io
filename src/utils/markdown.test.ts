import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml, renderMarkdownWithOutline } from "./markdown";

describe("Markdown sidebar outline", () => {
  it("uses the rendered heading IDs, including repeated and formatted headings", async () => {
    const { html, outline } = await renderMarkdownWithOutline(
      "## **Git** `worktree`\n\nText\n\n### Git patch\n\n## **Git** `worktree`",
    );
    expect(outline).toEqual([
      { id: "git-worktree", text: "Git worktree", depth: 2 },
      { id: "git-patch", text: "Git patch", depth: 3 },
      { id: "git-worktree-1", text: "Git worktree", depth: 2 },
    ]);
    for (const heading of outline) expect(html).toContain(`id="${heading.id}"`);
  });

  it("moves an inline contents block without removing article lists or footnotes", async () => {
    const markdown = "## Table of Contents\n\n## Section\n\n- Keep this list\n\nA note[^1].\n\n[^1]: Keep this footnote.";
    const { html, outline } = await renderMarkdownWithOutline(markdown, { includeToc: true });
    expect(outline).toEqual([{ id: "section", text: "Section", depth: 2 }]);
    expect(html).not.toContain('id="table-of-contents"');
    expect(html).not.toContain('href="#section"');
    expect(html).toContain("Keep this list");
    expect(html).toContain("Keep this footnote");
    // Existing callers can still render their contents inside the article.
    expect(await renderMarkdownToHtml(markdown, { includeToc: true })).toContain('href="#section"');
  });
});
