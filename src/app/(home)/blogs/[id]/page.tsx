import Client from "./Client";
import { blogIds } from "data/blogs/ids";
import { getBlogById } from "data/blogs/loader";
import { renderMarkdownToHtml } from "@utils/markdown";
import { notFound } from "next/navigation";

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
  const html = await renderMarkdownToHtml(blog.content, {
    includeMath: true,
    includeToc: true,
    allowDangerousHtml: true,
  });
  return <Client blogId={resolvedParams.id} html={html} blog={blog} />;
}

export function generateStaticParams() {
  if (blogIds.length === 0) {
    return [{ id: "__no_blogs__" }];
  }
  return blogIds.map((id) => ({ id }));
}
