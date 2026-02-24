import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import type { Options as ExternalLinkOptions } from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";

type MarkdownRendererOptions = {
  includeMath?: boolean;
  includeToc?: boolean;
  allowDangerousHtml?: boolean;
};

const externalLinkOptions: ExternalLinkOptions = {
  target: "_blank",
  rel: ["noopener", "noreferrer"],
  protocols: ["http", "https", "mailto"],
  properties: { className: ["external-link"] },
};

export async function renderMarkdownToHtml(
  markdown: string,
  options: MarkdownRendererOptions = {},
) {
  const {
    includeMath = false,
    includeToc = false,
    allowDangerousHtml = false,
  } = options;

  const processor = remark().use(remarkGfm);

  if (includeMath) {
    processor.use(remarkMath);
  }

  if (includeToc) {
    processor.use(remarkToc, { heading: "Table of Contents" });
  }

  processor.use(remarkRehype, { allowDangerousHtml });

  if (allowDangerousHtml) {
    processor.use(rehypeRaw);
  }

  processor.use(rehypeSlug);
  processor.use(rehypeExternalLinks, externalLinkOptions);

  if (includeMath) {
    processor.use(rehypeKatex);
  }

  processor.use(rehypeHighlight);
  processor.use(rehypeStringify, { allowDangerousHtml });

  const result = await processor.process(markdown);
  return result.toString();
}
