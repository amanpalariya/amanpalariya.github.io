import { doPathnamesMatch, joinPathnames } from "utils/pathname";

function getSubpagePathname(id: string) {
  return joinPathnames(this.pathname, id);
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
  project: {
    pathname: "/project/",
    name: "Projects",
    getSubpagePathname,
  },
};

export function getHomepageTabByPathname(pathname: string) {
  for (const tab in homepageTabs) {
    if (doPathnamesMatch(homepageTabs[tab].pathname, pathname)) {
      return homepageTabs[tab];
    }
  }
  return null;
}
