import { HtmlArticleRenderer } from "@components/article/Renderer";
import { homepageTabs } from "app/route-info";
import AboutArticle from "data/about";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";

async function getHtmlFromMarkdown(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      properties: { className: ["external-link"] },
    })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}

async function Main() {
  const html = await getHtmlFromMarkdown(AboutArticle);
  return (
    <HtmlArticleRenderer
      title={homepageTabs.about.name}
      html={html}
      showTitle
    />
  );
}

export default function About() {
  return <Main />;
}
