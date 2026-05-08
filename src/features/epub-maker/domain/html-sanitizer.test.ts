import { describe, expect, it } from "vitest";
import { createDefaultSanitizationPolicy } from "../constants";
import { inferTitleFromHtml, sanitizeHtmlContent } from "./html-sanitizer";

describe("inferTitleFromHtml", () => {
  it("prefers the first content heading over document chrome", () => {
    const html = `
      <html>
        <body>
          <nav><h1>Navigation Label</h1></nav>
          <main><h2>Article Heading</h2><p>Body text</p></main>
        </body>
      </html>
    `;

    expect(inferTitleFromHtml(html, "Fallback")).toBe("Article Heading");
  });

  it("falls back to text-derived titles when no heading exists", () => {
    expect(
      inferTitleFromHtml(
        "<article><p>One two three four five six seven eight nine.</p></article>",
        "Fallback",
      ),
    ).toBe("One two three four five six seven eight...");
  });
});

describe("sanitizeHtmlContent", () => {
  it("keeps allowed reading content while removing executable and navigational markup", () => {
    const policy = createDefaultSanitizationPolicy();
    const result = sanitizeHtmlContent(
      `
        <html>
          <head><title>Document Title</title></head>
          <body>
            <nav><p>Skip me</p></nav>
            <main>
              <h1>Chapter</h1>
              <p>Hello <strong>reader</strong>.</p>
              <script>alert("x")</script>
              <button>Click</button>
            </main>
          </body>
        </html>
      `,
      "Fallback",
      policy,
    );

    expect(result.title).toBe("Document Title");
    expect(result.chapterBodyHtml).toContain("<h1>Chapter</h1>");
    expect(result.chapterBodyHtml).toContain(
      "<p>Hello <strong>reader</strong>.</p>",
    );
    expect(result.chapterBodyHtml).not.toContain("script");
    expect(result.chapterBodyHtml).not.toContain("button");
    expect(result.chapterBodyHtml).not.toContain("Skip me");
    expect(result.stats.droppedNodes).toBeGreaterThanOrEqual(2);
  });

  it("rewrites relative links and images using the discovered base URL", () => {
    const result = sanitizeHtmlContent(
      `
        <html>
          <head><base href="https://example.com/articles/post/" /></head>
          <body>
            <article>
              <a href="../about">About</a>
              <img src="./cover.png" alt="Cover art" />
            </article>
          </body>
        </html>
      `,
      "Fallback",
      createDefaultSanitizationPolicy(),
    );

    expect(result.baseUrl).toBe("https://example.com/articles/post/");
    expect(result.chapterBodyHtml).toContain(
      'href="https://example.com/articles/about"',
    );
    expect(result.chapterBodyHtml).toContain(
      'src="https://example.com/articles/post/cover.png"',
    );
    expect(result.chapterBodyHtml).toContain('alt="Cover art"');
    expect(result.stats).toMatchObject({ rewrittenLinks: 1, rewrittenImages: 1 });
  });

  it("omits unsafe or unresolved outbound references", () => {
    const result = sanitizeHtmlContent(
      `
        <article>
          <a href="javascript:alert(1)">bad link</a>
          <img alt="missing source" />
          <img src="/relative-without-base.png" />
        </article>
      `,
      "Fallback",
      createDefaultSanitizationPolicy(),
    );

    expect(result.chapterBodyHtml).toContain("<a>bad link</a>");
    expect(result.chapterBodyHtml).not.toContain("javascript:");
    expect(result.chapterBodyHtml).not.toContain("missing source");
    expect(result.chapterBodyHtml).not.toContain("relative-without-base");
    expect(result.stats.droppedNodes).toBe(2);
  });

  it("limits preview content to the configured number of sanitized top-level nodes", () => {
    const policy = {
      ...createDefaultSanitizationPolicy(),
      maxPreviewNodes: 2,
    };

    const result = sanitizeHtmlContent(
      "<article><p>One</p><p>Two</p><p>Three</p></article>",
      "Fallback",
      policy,
    );

    expect(result.chapterBodyHtml).toBe("<p>One</p><p>Two</p><p>Three</p>");
    expect(result.previewHtml).toContain("<p>One</p><p>Two</p>");
    expect(result.previewHtml).not.toContain("<p>Three</p>");
  });
});
