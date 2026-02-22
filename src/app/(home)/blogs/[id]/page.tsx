import Client from "./Client";
import { blogIds } from "data/blogs/ids";
import { getBlogById } from "data/blogs/loader";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import { notFound } from "next/navigation";

async function getHtmlFromMarkdown(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkToc, { heading: "Table of Contents" })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return result.toString();
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  // Validate id on the server to return 404 for unknown ids in static export mode
  if (!blogIds.includes(resolvedParams.id)) return notFound();
  const blog = getBlogById(resolvedParams.id);
  if (!blog) return notFound();
  const html = await getHtmlFromMarkdown(blog.content);
  return <Client blogId={resolvedParams.id} html={html} blog={blog} />;
}

export function generateStaticParams() {
  if (blogIds.length === 0) {
    return [{ id: "__no_blogs__" }];
  }
  return blogIds.map((id) => ({ id }));
}
