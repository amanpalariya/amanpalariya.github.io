import Client from "./Client";
import { blogIds } from "data/blogs/ids";
import { notFound } from "next/navigation";

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  // Validate id on the server to return 404 for unknown ids in static export mode
  if (!blogIds.includes(params.id)) return notFound();
  return <Client blogId={params.id} />;
}

export function generateStaticParams() {
  return blogIds.map((id) => ({ id }));
}
