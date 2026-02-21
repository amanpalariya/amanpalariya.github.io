import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogMeta = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  published?: string;
  updated?: string;
};

export type BlogPost = BlogMeta & {
  content: string;
};

const markdownDirectory = path.join(
  process.cwd(),
  "src",
  "data",
  "blogs",
  "markdown",
);

export function getBlogIds(): string[] {
  if (!fs.existsSync(markdownDirectory)) return [];
  return fs
    .readdirSync(markdownDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllBlogs(): BlogMeta[] {
  return getBlogIds()
    .map((id) => {
    const fullPath = path.join(markdownDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return {
      id,
      title: String(data.title ?? id),
      description: String(data.description ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      published: data.published ? String(data.published) : undefined,
      updated: data.updated ? String(data.updated) : undefined,
    };
    })
    .sort((a, b) => {
      const aDate = a.published ? Date.parse(a.published) : 0;
      const bDate = b.published ? Date.parse(b.published) : 0;
      return bDate - aDate;
    });
}

export function getBlogById(id: string): BlogPost | null {
  const fullPath = path.join(markdownDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    id,
    title: String(data.title ?? id),
    description: String(data.description ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    published: data.published ? String(data.published) : undefined,
    updated: data.updated ? String(data.updated) : undefined,
    content,
  };
}