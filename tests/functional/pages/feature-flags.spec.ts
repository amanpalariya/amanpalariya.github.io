import { expect, test } from "../support/fixtures";
import { WorkData } from "../../../src/data";
import { getAllBlogs } from "../../../src/data/blogs/loader";
import BlogsData from "../../../src/data/blogs";
import { notFoundContent } from "../../../src/app/not-found-content";
import ProjectsData from "../../../src/data/projects";
import { getAllTools } from "../../../src/features/tools/data/tools-registry";
import { getToolsPageContent } from "../../../src/features/tools/data/content";

const projectTitles = ProjectsData.allProjects.map((project) => project.title);
const blogs = getAllBlogs();
const toolNames = getAllTools().map((tool) => tool.name);
const toolsPageContent = getToolsPageContent();

async function expectBlogsNavigationLinkVisible(page: import("@playwright/test").Page) {
  const mobileMenuTrigger = page.getByRole("button", { name: "Open mobile navigation menu" });
  if (await mobileMenuTrigger.isVisible()) {
    await mobileMenuTrigger.click();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile navigation menu" })
        .getByRole("link", { name: "Blogs" }),
    ).toBeVisible();
    return;
  }

  const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
  const primaryBlogsLink = primaryNavigation.getByRole("link", { name: "Blogs" });
  await expect(primaryBlogsLink).toBeVisible();
}

test.describe("Feature Flags page", () => {
  test("persists changed feature flag values across refreshes", async ({ page, featureFlags }) => {
    await featureFlags.goto();

    const blogsFlag = featureFlags.flag("Blogs");
    const emptyStatesFlag = featureFlags.flag("Force empty states");
    await expect(blogsFlag).toBeChecked();
    await expect(emptyStatesFlag).not.toBeChecked();

    await blogsFlag.setChecked(false, { force: true });
    await emptyStatesFlag.setChecked(true, { force: true });
    await page.reload();

    await expect(page.getByRole("checkbox", { name: "Blogs" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Force empty states" })).toBeChecked();
  });

  test("force empty states flag shows empty states instead of real content", async ({
    page,
    featureFlags,
  }) => {
    await page.goto("/projects");
    for (const projectTitle of projectTitles) {
      await expect(page.getByText(projectTitle)).toBeVisible();
    }
    await expect(page.getByText(ProjectsData.projectsPage.emptyStateTitle)).toHaveCount(0);

    await page.goto("/blogs");
    for (const blog of blogs) {
      await expect(page.getByText(blog.title)).toBeVisible();
    }
    await expect(page.getByText(BlogsData.blogsPage.emptyStateTitle)).toHaveCount(0);

    await page.goto("/tools");
    for (const toolName of toolNames) {
      await expect(page.getByText(toolName)).toBeVisible();
    }
    await expect(page.getByText(toolsPageContent.emptyStateTitle)).toHaveCount(0);

    await featureFlags.setFlag("Force empty states", true);

    await page.goto("/");
    await expect(page.getByText(WorkData.emptyStateTitle)).toBeVisible();
    await expect(page.getByText(ProjectsData.projectsPage.emptyStateTitle)).toBeVisible();
    for (const projectTitle of projectTitles) {
      await expect(page.getByText(projectTitle)).toHaveCount(0);
    }

    await page.goto("/projects");
    await expect(page.getByText(ProjectsData.projectsPage.emptyStateTitle)).toBeVisible();
    for (const projectTitle of projectTitles) {
      await expect(page.getByText(projectTitle)).toHaveCount(0);
    }

    await page.goto("/blogs");
    await expect(page.getByText(BlogsData.blogsPage.emptyStateTitle)).toBeVisible();
    for (const blog of blogs) {
      await expect(page.getByText(blog.title)).toHaveCount(0);
    }

    await page.goto("/tools");
    await expect(page.getByText(toolsPageContent.emptyStateTitle)).toBeVisible();
    for (const toolName of toolNames) {
      await expect(page.getByText(toolName)).toHaveCount(0);
    }
  });

  test("blogs flag controls blog navigation and blog page access", async ({ page, featureFlags }) => {
    await featureFlags.setFlag("Blogs", false);

    await page.goto("/");
    const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(primaryNavigation.getByRole("link", { name: "Blogs" })).toHaveCount(0);

    await page.goto("/blogs");
    await expect(page.getByRole("heading", { name: notFoundContent.title })).toBeVisible();
    for (const blog of blogs) {
      await expect(page.getByText(blog.title)).toHaveCount(0);
    }

    for (const blog of blogs) {
      await page.goto(`/blogs/${blog.id}`);
      await expect(page.getByText(blog.title)).toHaveCount(0);
    }

    await featureFlags.setFlag("Blogs", true);

    await page.goto("/");
    await expectBlogsNavigationLinkVisible(page);

    await page.goto("/blogs");
    await expect(page.getByRole("heading", { name: "My Blogs" })).toBeVisible();
    for (const blog of blogs) {
      await expect(page.getByText(blog.title)).toBeVisible();
    }

    for (const blog of blogs) {
      await page.goto(`/blogs/${blog.id}`);
      await expect(page.getByRole("heading", { name: blog.title })).toBeVisible();
    }
  });
});
