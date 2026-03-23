import Client from "./Client";
import { projectIdsWithDetails } from "data/projects/ids";
import { getProjectById } from "data/projects/loader";
import { renderMarkdownToHtml } from "@utils/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const project = getProjectById(resolvedParams.id);

  if (!project) {
    return {
      title: getPageTitle("Project"),
    };
  }

  return {
    title: getPageTitle(project.title),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  if (!projectIdsWithDetails.includes(resolvedParams.id)) return notFound();

  const project = getProjectById(resolvedParams.id);
  if (!project) return notFound();

  const html = await renderMarkdownToHtml(project.content, {
    includeMath: true,
    includeToc: true,
    allowDangerousHtml: true,
  });

  return <Client html={html} project={project} />;
}

export function generateStaticParams() {
  if (projectIdsWithDetails.length === 0) {
    return [{ id: "__no_projects__" }];
  }

  return projectIdsWithDetails.map((id) => ({ id }));
}
