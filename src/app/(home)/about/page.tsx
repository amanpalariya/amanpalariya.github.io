import AboutData from "data/about";
import { renderMarkdownToHtml } from "@utils/markdown";
import AboutClient from "./Client";

export default async function About() {
  const html = await renderMarkdownToHtml(AboutData.markdown, {
    allowDangerousHtml: true,
  });

  return <AboutClient html={html} />;
}
