import { getBlogIds } from "./loader";

// Server-safe list of blog ids for static export
export const blogIds = getBlogIds();
