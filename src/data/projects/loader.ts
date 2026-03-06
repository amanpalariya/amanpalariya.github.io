import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ProjectsData from ".";

export type ProjectMeta = {
  id: string;
  title: string;
  description: string;
  url?: string;
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

function getProjectMetaById(id: string): ProjectMeta | null {
  return ProjectsData.allProjects.find((project) => project.id === id) ?? null;
}

export function getProjectIdsWithDetails(): string[] {
  if (!fs.existsSync(markdownDirectory)) return [];

  const idsFromMarkdown = fs
    .readdirSync(markdownDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));

  const validProjectIds = new Set(ProjectsData.allProjects.map((project) => project.id));

  return idsFromMarkdown.filter((id) => validProjectIds.has(id));
}

export function getAllProjects(): ProjectMeta[] {
  return ProjectsData.allProjects;
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
    content,
  };
}
