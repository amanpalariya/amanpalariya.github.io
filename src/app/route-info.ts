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
