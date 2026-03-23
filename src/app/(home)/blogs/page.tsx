import BlogsClient from "./BlogsClient";
import { getAllBlogs } from "data/blogs/loader";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";

export const metadata: Metadata = {
  title: getPageTitle(homepageTabs.blogs.name),
};

export default function Home() {
  const blogs = getAllBlogs();
  return <BlogsClient blogs={blogs} />;
}
