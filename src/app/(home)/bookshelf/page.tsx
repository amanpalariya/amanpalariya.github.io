import Image from "next/image";
import type { Metadata } from "next";
import ContentSection from "@components/page/common/ContentSection";
import PageIntro from "@components/page/common/PageIntro";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { books } from "data/bookshelf";
import styles from "./bookshelf.module.css";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

export default function BookshelfPage() {
  return (
    <>
      <PageIntro title={name} />
      <ContentSection aria-label="Books">
        <ul className={styles.grid} role="list">
          {books.map(({ id, title, author, cover }) => (
            <li key={id}>
              <Image
                src={cover}
                alt=""
                width={240}
                height={360}
                unoptimized
                className={styles.cover}
              />
              <p className={styles.title}>{title}</p>
              <p className={styles.author}>{author}</p>
            </li>
          ))}
        </ul>
      </ContentSection>
    </>
  );
}
