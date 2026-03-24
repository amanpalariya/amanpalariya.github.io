import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ProjectsData from ".";
import {
  mergeExternalLinks,
  normalizeExternalLinks,
  type ExternalLink,
} from "data/external-links";

export type ProjectMeta = {
  id: string;
  title: string;
  description: string;
  url?: string;
  externalLinks?: ExternalLink[];
};

export type ProjectDetail = ProjectMeta & {
  content: string;
};

const markdownDirectory = path.join(
  process.cwd(),
  "src",
  "data",
  "projects",
  "markdown",
);

function resolveExternalLinks({
  links,
  legacyUrl,
}: {
  links: unknown;
  legacyUrl?: string;
}): ExternalLink[] {
  return mergeExternalLinks(normalizeExternalLinks(links), legacyUrl);
}

function withResolvedExternalLinks<
  T extends { externalLinks?: unknown; url?: string },
>(project: T): Omit<T, "externalLinks"> & { externalLinks: ExternalLink[] } {
  return {
    ...project,
    externalLinks: resolveExternalLinks({
      links: project.externalLinks,
      legacyUrl: project.url,
    }),
  };
}

function getProjectMetaById(id: string): ProjectMeta | null {
  const project = ProjectsData.allProjects.find((entry) => entry.id === id);
  if (!project) return null;
  return withResolvedExternalLinks(project);
}

export function getProjectIdsWithDetails(): string[] {
  if (!fs.existsSync(markdownDirectory)) return [];

  const idsFromMarkdown = fs
    .readdirSync(markdownDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));

  const validProjectIds = new Set(
    ProjectsData.allProjects.map((project) => project.id),
  );

  return idsFromMarkdown.filter((id) => validProjectIds.has(id));
}

export function getAllProjects(): ProjectMeta[] {
  return ProjectsData.allProjects.map((project) =>
    withResolvedExternalLinks(project),
  );
}

export function getProjectById(id: string): ProjectDetail | null {
  const meta = getProjectMetaById(id);
  if (!meta) return null;

  const detailedIds = new Set(getProjectIdsWithDetails());
  if (!detailedIds.has(id)) return null;

  const fullPath = path.join(markdownDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...meta,
    title: String(data.title ?? meta.title),
    description: String(data.description ?? meta.description),
    externalLinks: withResolvedExternalLinks({
      ...meta,
      externalLinks: [
        ...(meta.externalLinks ?? []),
        ...normalizeExternalLinks(data.externalLinks),
      ],
    }).externalLinks,
    content,
  };
}
