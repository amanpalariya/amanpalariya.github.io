import FeatureFlagsData from "data/features";
import { doPathnamesMatch, joinPathnames } from "utils/pathname";

type HomepageTab = {
  pathname: string;
  name: string;
  getSubpagePathname?: (id: string) => string;
};

function createSubpagePathnameGetter(pathname: string) {
  return (id: string) => joinPathnames(pathname, id);
}

export const homepageTabs = {
  home: {
    pathname: "/",
    name: "Home",
  },
  about: {
    pathname: "/about/",
    name: "About",
  },
  projects: {
    pathname: "/projects/",
    name: "Projects",
    getSubpagePathname: createSubpagePathnameGetter("/projects/"),
  },
  cv: {
    pathname: "/cv/",
    name: "CV",
  },
  blogs: {
    pathname: "/blogs/",
    name: "Blogs",
    getSubpagePathname: createSubpagePathnameGetter("/blogs/"),
  },
  tools: {
    pathname: "/tools/",
    name: "Tools",
  },
} satisfies Record<string, HomepageTab>;

export function getHomepageTabByPathname(pathname: string) {
  return (
    Object.values(homepageTabs).find((tab) =>
      doPathnamesMatch(tab.pathname, pathname),
    ) ?? null
  );
}

/** Header routes include utility pages that are absent from sidebar navigation. */
const headerPages = [
  ...Object.values(homepageTabs).map((tab) => ({
    pathname: tab.pathname,
    title: tab === homepageTabs.cv ? "Curriculum Vitae" : tab.name,
    includeSubpages: tab.pathname !== "/",
  })),
  {
    pathname: "/features/",
    title: FeatureFlagsData.featuresPage.title,
    includeSubpages: false,
  },
];

export function getHeaderPageByPathname(pathname: string) {
  return (
    headerPages.find(
      (page) =>
        doPathnamesMatch(page.pathname, pathname) ||
        (page.includeSubpages && pathname.startsWith(page.pathname)),
    ) ?? null
  );
}
