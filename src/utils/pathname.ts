const sep = "/";

function addTrailingSlash(pathname: string) {
  if (pathname.length == 0) return "";
  if (pathname[pathname.length - 1] != "/") return pathname + "/";
  else return pathname;
}

export function isPathnameAbsolute(pathname: string) {
  return pathname.length > 0 && pathname[0] == "/";
}

export function isPathnameRelative(pathname: string) {
  return !isPathnameAbsolute(pathname);
}

export function getCanonicalPathname(pathname: string) {
  return addTrailingSlash(pathname);
}

export function doPathnamesMatch(pathname1: string, pathname2: string) {
  pathname1 = getCanonicalPathname(pathname1);
  pathname2 = getCanonicalPathname(pathname2);
  return pathname1 == pathname2;
}

export function getPathnameDepth(pathname: string) {
  pathname = getCanonicalPathname(pathname);
  return pathname.split(sep).length - (isPathnameAbsolute(pathname) ? 2 : 1);
}

export function trimPathnameToDepth(pathname: string, depth: number) {
  pathname = getCanonicalPathname(pathname);
  return getCanonicalPathname(
    pathname
      .split(sep)
      .slice(0, isPathnameAbsolute(pathname) ? depth + 1 : depth)
      .join(sep)
  );
}

export function joinPathnames(pathname1: string, pathname2: string) {
  pathname1 = getCanonicalPathname(pathname1);
  pathname2 = getCanonicalPathname(pathname2);
  if (isPathnameRelative(pathname2)) return pathname1 + pathname2;
  else return pathname1 + pathname2.slice(1);
}
