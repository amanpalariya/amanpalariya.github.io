import { PersonalData, CvData } from "../../../src/data";
import AboutData from "../../../src/data/about";
import { getAllBlogs } from "../../../src/data/blogs/loader";
import { getAllProjects, getProjectById, getProjectIdsWithDetails } from "../../../src/data/projects/loader";
import { getAllTools } from "../../../src/features/tools/data/tools-registry";

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
    heading: getAllTools()[0].name,
  },
  {
    name: "Calendar Drill",
    path: "/tools/calendar-drill",
    heading: "Calendar Drill",
  },
  {
    name: "Bilingual Story Reader",
    path: "/tools/bilingual-story-reader",
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
    heading: getAllProjects()[0].title,
  },
  ...detailedProjectCases,
  {
    name: "Blogs",
    path: "/blogs",
    heading: getAllBlogs()[0].title,
  },
  ...detailedBlogCases,
  {
    name: "Bookshelf",
    path: "/bookshelf",
    heading: "Bookshelf",
  },
  {
    name: "Feature Flags",
    path: "/features",
    heading: "Feature Flags",
  },
];
