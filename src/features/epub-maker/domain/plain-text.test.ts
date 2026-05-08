import { describe, expect, it } from "vitest";
import {
  getTextPreviewHtml,
  inferTitleFromText,
  plainTextToHtml,
} from "./plain-text";

describe("plain text conversion", () => {
  it("escapes XML-sensitive characters and preserves line breaks as HTML breaks", () => {
    expect(plainTextToHtml(`A&B <tag> "quote" 'apostrophe'\nnext`)).toBe(
      "A&amp;B &lt;tag&gt; &quot;quote&quot; &apos;apostrophe&apos;<br />next",
    );
  });

  it("infers a concise title from normalized text", () => {
    expect(
      inferTitleFromText(
        "  One\n two\tthree four five six seven eight nine  ",
        "Fallback",
      ),
    ).toBe("One two three four five six seven eight...");
  });

  it("uses the fallback for empty text", () => {
    expect(inferTitleFromText(" \n\t ", "Fallback")).toBe("Fallback");
  });

  it("embeds escaped content in the generated preview document", () => {
    const preview = getTextPreviewHtml("<script>alert(1)</script>");

    expect(preview).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(preview).not.toContain("<script>alert(1)</script>");
    expect(preview).toContain('class="plain-text"');
  });
});
