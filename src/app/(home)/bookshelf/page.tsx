import { VisuallyHidden } from "@chakra-ui/react";
import Image from "next/image";
import type { Metadata } from "next";
import ContentSection from "@components/page/common/ContentSection";
import { SubtitleText } from "@components/core/Texts";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { bookshelf } from "data/bookshelf";
import styles from "./bookshelf.module.css";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

export default function BookshelfPage() {
  const { intro, isSample, books } = bookshelf;

  return (
    <>
      <header className={styles.intro}>
        <VisuallyHidden as="h1">{name}</VisuallyHidden>
        <SubtitleText>{intro}</SubtitleText>
      </header>
      <ContentSection aria-label="Books">
        {isSample && <p className={styles.sampleLabel}>Sample books</p>}
        <ul className={styles.grid} role="list">
          {books.map(({ id, title, author, cover, status, note }) => (
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
              {status && <p className={styles.status}>{status}</p>}
              {note && (
                <details className={styles.note}>
                  <summary aria-label={`My note on ${title}`}>My note</summary>
                  <p>{note}</p>
                </details>
              )}
            </li>
          ))}
        </ul>
      </ContentSection>
    </>
  );
}
