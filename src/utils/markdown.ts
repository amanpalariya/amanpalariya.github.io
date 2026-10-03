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
import type { Root, RootContent } from "hast";

export type MarkdownHeading = { id: string; text: string; depth: number };

function nodeText(node: RootContent): string {
  if (node.type === "text") return node.value;
  return "children" in node ? node.children.map(nodeText).join("") : "";
}

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
  return renderMarkdown(markdown, options);
}

export async function renderMarkdownWithOutline(
  markdown: string,
  options: MarkdownRendererOptions = {},
) {
  const outline: MarkdownHeading[] = [];
  const html = await renderMarkdown(markdown, options, outline);
  return { html, outline };
}

async function renderMarkdown(
  markdown: string,
  options: MarkdownRendererOptions,
  outline?: MarkdownHeading[],
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
  if (outline) {
    processor.use(() => (tree: Root) => {
      // The sidebar replaces an authored/generated contents block in the body.
      tree.children = tree.children.filter((node, index, nodes) => {
        const isContentsHeading = (item?: RootContent) =>
          item?.type === "element" &&
          /^h[1-6]$/.test(item.tagName) &&
          /^table of contents$/i.test(nodeText(item).trim());
        if (isContentsHeading(node)) return false;
        if (node.type === "element" && ["ul", "ol"].includes(node.tagName)) {
          let previous = index - 1;
          while (
            previous >= 0 &&
            nodes[previous].type === "text" &&
            !nodeText(nodes[previous]).trim()
          )
            previous--;
          if (isContentsHeading(nodes[previous])) return false;
        }
        return true;
      });

      function collect(nodes: RootContent[]) {
        for (const node of nodes) {
          if (node.type !== "element") continue;
          if (/^h[1-6]$/.test(node.tagName) && node.properties.id) {
            outline!.push({
              id: String(node.properties.id),
              text: nodeText(node),
              depth: Number(node.tagName.slice(1)),
            });
          }
          // Footnote labels are not article sections.
          if (node.properties.dataFootnotes === undefined)
            collect(node.children);
        }
      }
      collect(tree.children);
    });
  }
  processor.use(rehypeExternalLinks, externalLinkOptions);

  if (includeMath) {
    processor.use(rehypeKatex);
  }

  processor.use(rehypeHighlight);
  processor.use(rehypeStringify, { allowDangerousHtml });

  const result = await processor.process(markdown);
  return result.toString();
}
