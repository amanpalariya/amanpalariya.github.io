import * as art from "@components/article/Components";

interface Blog {
  id: string;
  title: string;
  description: string;
  url?: string;
  content?: any[];
}

const allBlogs: Blog[] = [];

const BlogsData = {
  blogsPage: {
    title: "My Blogs",
    subtitle:
      "I write my opinions, thoughts, and tutorials sometimes, read all of them here.",
  },
  allBlogs,
};

export default BlogsData;
