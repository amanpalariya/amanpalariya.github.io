interface Blog {
  id: string;
  title: string;
  description: string;
  url?: string;
  content?: any[];
  tags?: string[];
}

const allBlogs: Blog[] = [
  {
    id: "hello-world",
    title: "Hello, Blogs!",
    description:
      "An example post showcasing text, links, images, code blocks, tags, and an interactive widget.",
    tags: ["intro", "nextjs", "chakra"],
    content: [
      { t: "h1", c: "Welcome to my blog" },
      {
        t: "para",
        c: "This is a demo post rendered from structured data. Content lives in src/data/blogs, media lives under public/.",
      },
      {
        t: "para",
        c: [
          "You can style text with ",
          { t: "b", c: "bold" },
          ", ",
          { t: "i", c: "italics" },
          ", and add ",
          {
            t: "link",
            url: "https://nextjs.org",
            isExternal: true,
            c: "links",
          },
          ".",
        ],
      },
      { t: "h2", c: "Image from public/" },
      {
        t: "img",
        src: "/images/logo/oracle.svg",
        alt: "Oracle logo",
        caption: "Sample image served from public/images/logo/oracle.svg",
      },
      { t: "h2", c: "Code block" },
      {
        t: "code",
        c: "function greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet('World'));",
      },
      { t: "h2", c: "Interactive element" },
      { t: "para", c: "Client-side interactivity works inside blogs:" },
      { t: "interactive" },
    ],
  },
];

const BlogsData = {
  blogsPage: {
    title: "My Blogs",
    subtitle:
      "I write my opinions, thoughts, and tutorials sometimes, read all of them here.",
  },
  allBlogs,
};

export default BlogsData;
