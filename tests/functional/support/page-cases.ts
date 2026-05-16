import { PersonalData, CvData } from "../../../src/data";
import AboutData from "../../../src/data/about";
import BlogsData from "../../../src/data/blogs";
import { getAllBlogs } from "../../../src/data/blogs/loader";
import { getProjectById, getProjectIdsWithDetails } from "../../../src/data/projects/loader";
import ProjectsData from "../../../src/data/projects";
import { getToolsPageContent } from "../../../src/features/tools/data/content";

export type FunctionalPageCase = {
  name: string;
  path: string;
  heading: RegExp | string;
};

const detailedProjectCases: FunctionalPageCase[] = getProjectIdsWithDetails()
  .map((id) => getProjectById(id))
  .filter((project): project is NonNullable<typeof project> => Boolean(project))
  .map((project) => ({
    name: `Project detail: ${project.title}`,
    path: `/projects/${project.id}`,
    heading: project.title,
  }));

const detailedBlogCases: FunctionalPageCase[] = getAllBlogs().map((blog) => ({
  name: `Blog detail: ${blog.title}`,
  path: `/blogs/${blog.id}`,
  heading: blog.title,
}));

export const toolPageCases: FunctionalPageCase[] = [
  {
    name: "Tools",
    path: "/tools",
    heading: getToolsPageContent().title,
  },
  {
    name: "Calendar Drill",
    path: "/tools/calendar-drill",
    heading: "Calendar Drill",
  },
  {
    name: "Bilingual Story Reader",
    path: "/tools/story-reader",
    heading: "Bilingual Story Reader",
  },
  {
    name: "EPUB Maker",
    path: "/tools/epub-maker",
    heading: "EPUB Maker",
  },
];

export const nonToolPageCases: FunctionalPageCase[] = [
  {
    name: "Home",
    path: "/",
    heading: `I'm ${PersonalData.name.full}`,
  },
  {
    name: "About",
    path: "/about",
    heading: AboutData.aboutPage.title,
  },
  {
    name: "CV",
    path: "/cv",
    heading: CvData.profile.name,
  },
  {
    name: "Projects",
    path: "/projects",
    heading: ProjectsData.projectsPage.title,
  },
  ...detailedProjectCases,
  {
    name: "Blogs",
    path: "/blogs",
    heading: BlogsData.blogsPage.title,
  },
  ...detailedBlogCases,
  {
    name: "Feature Flags",
    path: "/features",
    heading: "Feature Flags",
  },
];
