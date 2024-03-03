"use client";

import ArticleRenderer from "@components/article/Renderer";
import { homepageTabs } from "app/route-info";
import AboutArticle from "data/about";

function Main() {
  return (
    <ArticleRenderer
      title={homepageTabs.about.name}
      content={AboutArticle.content}
    />
  );
}

export default function About() {
  return (
    <>
      <Main />
    </>
  );
}
