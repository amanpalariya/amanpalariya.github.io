import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

export function extractFirstImageSrcFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return match?.[1] ?? null;
}

function BufferedPreviewIframe({
  title,
  srcDoc,
  filter,
}: {
  title: string;
  srcDoc: string;
  filter: string;
}) {
  const [activeFrameIndex, setActiveFrameIndex] = useState<0 | 1>(0);
  const [frameDocs, setFrameDocs] = useState<[string, string]>([
    srcDoc,
    srcDoc,
  ]);
  const [pendingFrameIndex, setPendingFrameIndex] = useState<0 | 1 | null>(
    null,
  );

  useEffect(() => {
    const currentDoc = frameDocs[activeFrameIndex];
    if (srcDoc === currentDoc) return;

    const nextFrameIndex: 0 | 1 = activeFrameIndex === 0 ? 1 : 0;
    if (frameDocs[nextFrameIndex] === srcDoc) {
      setPendingFrameIndex(null);
      setActiveFrameIndex(nextFrameIndex);
      return;
    }

    setFrameDocs((previous) => {
      if (previous[nextFrameIndex] === srcDoc) return previous;
      const nextDocs: [string, string] = [previous[0], previous[1]];
      nextDocs[nextFrameIndex] = srcDoc;
      return nextDocs;
    });
    setPendingFrameIndex(nextFrameIndex);
  }, [activeFrameIndex, frameDocs, srcDoc]);

  return (
    <Box position={"relative"} w={"full"} h={"full"}>
      {[0, 1].map((frameIndex) => {
        const typedFrameIndex = frameIndex as 0 | 1;
        const isActive = typedFrameIndex === activeFrameIndex;

        return (
          <iframe
            key={`${title}-${typedFrameIndex}`}
            title={`${title}-${typedFrameIndex}`}
            srcDoc={frameDocs[typedFrameIndex]}
            sandbox=""
            onLoad={() => {
              if (pendingFrameIndex !== typedFrameIndex) return;
              setActiveFrameIndex(typedFrameIndex);
              setPendingFrameIndex(null);
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              opacity: isActive ? 1 : 0,
              filter,
            }}
          />
        );
      })}
    </Box>
  );
}

function BufferedPreviewImage({
  title,
  src,
  filter,
}: {
  title: string;
  src: string;
  filter: string;
}) {
  const [activeFrameIndex, setActiveFrameIndex] = useState<0 | 1>(0);
  const [frameSrcs, setFrameSrcs] = useState<[string, string]>([src, src]);
  const [pendingFrameIndex, setPendingFrameIndex] = useState<0 | 1 | null>(
    null,
  );
  const decodeRequestIdRef = useRef(0);
  const activeSrc = frameSrcs[activeFrameIndex];

  useEffect(() => {
    if (src === activeSrc) return;

    const nextFrameIndex: 0 | 1 = activeFrameIndex === 0 ? 1 : 0;
    setFrameSrcs((previous) => {
      if (previous[nextFrameIndex] === src) return previous;
      const nextSrcs: [string, string] = [previous[0], previous[1]];
      nextSrcs[nextFrameIndex] = src;
      return nextSrcs;
    });
    setPendingFrameIndex(nextFrameIndex);

    let isCancelled = false;
    const requestId = decodeRequestIdRef.current + 1;
    decodeRequestIdRef.current = requestId;
    const preloadImage = new Image();
    preloadImage.decoding = "async";

    const activateDecodedFrame = () => {
      if (isCancelled || decodeRequestIdRef.current !== requestId) return;
      window.requestAnimationFrame(() => {
        if (isCancelled || decodeRequestIdRef.current !== requestId) return;
        setActiveFrameIndex(nextFrameIndex);
        setPendingFrameIndex(null);
      });
    };

    preloadImage.onload = () => {
      if (typeof preloadImage.decode === "function") {
        preloadImage
          .decode()
          .catch(() => undefined)
          .finally(activateDecodedFrame);
        return;
      }
      activateDecodedFrame();
    };

    preloadImage.onerror = () => {
      activateDecodedFrame();
    };

    preloadImage.src = src;
    if (preloadImage.complete) {
      preloadImage.onload?.(new Event("load"));
    }

    return () => {
      isCancelled = true;
    };
  }, [activeFrameIndex, activeSrc, src]);

  return (
    <Box position={"relative"} w={"full"} h={"full"}>
      {[0, 1].map((frameIndex) => {
        const typedFrameIndex = frameIndex as 0 | 1;
        const isActive = typedFrameIndex === activeFrameIndex;

        return (
          <img
            key={`${title}-img-${typedFrameIndex}`}
            src={frameSrcs[typedFrameIndex]}
            alt={""}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              userSelect: "none",
              opacity: isActive ? 1 : 0,
              filter,
            }}
          />
        );
      })}
    </Box>
  );
}

export function BufferedCoverPreview({
  title,
  srcDoc,
  filter,
}: {
  title: string;
  srcDoc: string;
  filter: string;
}) {
  const imageSrc = useMemo(() => extractFirstImageSrcFromHtml(srcDoc), [srcDoc]);
  if (!imageSrc) {
    return <BufferedPreviewIframe title={title} srcDoc={srcDoc} filter={filter} />;
  }
  return <BufferedPreviewImage title={title} src={imageSrc} filter={filter} />;
}
