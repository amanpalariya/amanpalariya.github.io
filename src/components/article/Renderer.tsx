"use client";
import { Box, Spacer, VStack } from "@chakra-ui/react";
import { SectionText } from "@components/core/Texts";
import * as art from "@components/article/Components";

import React from "react";

type Descriptor =
  | { t: "h1" | "h2" | "h3"; c: any }
  | { t: "para"; c: any }
  | { t: "b" | "i"; c: any }
  | { t: "img"; src: string; alt?: string; caption?: string }
  | { t: "link"; url: string; isExternal?: boolean; c?: string }
  | { t: "code"; c: any }
  | { t: "interactive" };

function renderInline(node: any, key?: React.Key): React.ReactNode {
  if (node == null) return null;
  if (typeof node === "string" || typeof node === "number") return node;
  if (Array.isArray(node)) return node.map((n, i) => renderInline(n, i));
  if (typeof node === "object" && node.t) {
    const d = node as Descriptor;
    switch (d.t) {
      case "b":
        return <art.b key={key}>{(d as any).c}</art.b>;
      case "i":
        return <art.i key={key}>{(d as any).c}</art.i>;
      case "link": {
        const { url, isExternal, c } = d as any;
        return (
          <art.link key={key} url={url} isExternal={isExternal}>
            {c}
          </art.link>
        );
      }
      default:
        return null;
    }
  }
  return null;
}

function renderBlock(node: any, key: React.Key) {
  if (node == null) return null;
  if (typeof node !== "object" || !node.t) return node; // assume already a React node
  const d = node as Descriptor;
  switch (d.t) {
    case "h1":
      return <art.h1 key={key}>{(d as any).c}</art.h1>;
    case "h2":
      return <art.h2 key={key}>{(d as any).c}</art.h2>;
    case "h3":
      return <art.h3 key={key}>{(d as any).c}</art.h3>;
    case "para":
      return <art.para key={key}>{renderInline((d as any).c)}</art.para>;
    case "img": {
      const { src, alt, caption } = d as any;
      return <art.img key={key} src={src} alt={alt} caption={caption} />;
    }
    case "code":
      return <art.code key={key}>{(d as any).c}</art.code>;
    case "interactive":
      return <art.interactive key={key} />;
    default:
      return null;
  }
}

export default function ArticleRenderer({
  content,
  title,
}: {
  content: any[];
  title: string;
}) {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"}>
      <VStack align={"stretch"} gap={"5"}>
        <SectionText>{title}</SectionText>
        <Spacer h={2} />
        {Array.isArray(content)
          ? content.map((n, i) => renderBlock(n, i))
          : content}
      </VStack>
    </Box>
  );
}
