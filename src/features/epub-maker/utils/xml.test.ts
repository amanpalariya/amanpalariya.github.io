import { describe, expect, it } from "vitest";
import { escapeXml } from "./xml";

describe("escapeXml", () => {
  it("escapes every XML-sensitive character", () => {
    expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
  });

  it("does not alter ordinary text", () => {
    expect(escapeXml("Plain text 123")).toBe("Plain text 123");
  });
});
