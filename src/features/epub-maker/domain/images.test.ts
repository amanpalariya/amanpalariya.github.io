import { describe, expect, it, vi } from "vitest";
import { registerImageAsset } from "./images";

describe("registerImageAsset manual replacements", () => {
  it("embeds a manual blob replacement without fetching the remote source", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const imagesByKey = new Map();
    let imageCount = 0;

    const result = await registerImageAsset({
      src: "https://example.com/blocked.png",
      baseUrl: null,
      embedRemoteImages: true,
      manualImageReplacements: {
        "https://example.com/blocked.png": {
          blob: new Blob(["replacement"], { type: "image/png" }),
          label: "replacement.png",
        },
      },
      imagesByKey,
      nextImageNumber: () => {
        imageCount += 1;
        return imageCount;
      },
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.warning).toBeUndefined();
    expect(result.localHref).toBe("images/image-1.png");
    expect(imagesByKey.get("https://example.com/blocked.png")).toMatchObject({
      href: "images/image-1.png",
      mediaType: "image/png",
      sourceUrl: "https://example.com/blocked.png",
    });

    fetchSpy.mockRestore();
  });

  it("dedupes repeated source URLs after a manual replacement is registered", async () => {
    const imagesByKey = new Map();
    let imageCount = 0;
    const params = {
      src: "https://example.com/reused.jpg",
      baseUrl: null,
      embedRemoteImages: true,
      manualImageReplacements: {
        "https://example.com/reused.jpg": {
          blob: new Blob(["replacement"], { type: "image/jpeg" }),
          label: "replacement.jpg",
        },
      },
      imagesByKey,
      nextImageNumber: () => {
        imageCount += 1;
        return imageCount;
      },
    };

    const first = await registerImageAsset(params);
    const second = await registerImageAsset(params);

    expect(first.localHref).toBe("images/image-1.jpg");
    expect(second.localHref).toBe("images/image-1.jpg");
    expect(imagesByKey.size).toBe(1);
    expect(imageCount).toBe(1);
  });
});
