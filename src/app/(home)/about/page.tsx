"use client";

import ArticleRenderer from "@components/article/Renderer";
import AboutArticle from "data/about";

function Main() {
  return <ArticleRenderer title="About" content={AboutArticle.content} />;
}

export default function About() {
  return (
    <>
      <Main />
    </>
  );
}
