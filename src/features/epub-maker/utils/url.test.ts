import { describe, expect, it } from "vitest";
import { resolveAbsoluteUrl } from "./url";

describe("resolveAbsoluteUrl", () => {
  it("preserves absolute and data URLs", () => {
    expect(resolveAbsoluteUrl("https://example.com/a", null)).toBe(
      "https://example.com/a",
    );
    expect(resolveAbsoluteUrl("data:image/png;base64,abc", null)).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("resolves protocol-relative and path-relative URLs against the base URL", () => {
    expect(resolveAbsoluteUrl("//cdn.example.com/a.png", "http://site.test/page")).toBe(
      "http://cdn.example.com/a.png",
    );
    expect(resolveAbsoluteUrl("../img.png", "https://site.test/articles/post/")).toBe(
      "https://site.test/articles/img.png",
    );
  });

  it("returns null for relative URLs without a base or unparseable base URLs", () => {
    expect(resolveAbsoluteUrl("/img.png", null)).toBeNull();
    expect(resolveAbsoluteUrl("/img.png", "not a url")).toBeNull();
    expect(resolveAbsoluteUrl("", "https://example.com")).toBeNull();
  });
});
