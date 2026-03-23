import BlogsClient from "./BlogsClient";
import { getAllBlogs } from "data/blogs/loader";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";

export const metadata: Metadata = {
  title: getPageTitle("Blogs"),
};

export default function Home() {
  const blogs = getAllBlogs();
  return <BlogsClient blogs={blogs} />;
}
