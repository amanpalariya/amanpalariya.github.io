import BlogsClient from "./BlogsClient";
import { getAllBlogs } from "data/blogs/loader";

export default function Home() {
  const blogs = getAllBlogs();
  return <BlogsClient blogs={blogs} />;
}
