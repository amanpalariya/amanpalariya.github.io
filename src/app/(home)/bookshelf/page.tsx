import { VisuallyHidden } from "@chakra-ui/react";
import Image from "next/image";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { bookshelf } from "data/bookshelf";
import ReviewPopover from "./ReviewPopover";
import styles from "./bookshelf.module.css";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

function formatReadDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: value.length > 4 ? "short" : undefined,
    day: value.length > 7 ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export default function BookshelfPage() {
  const { isSample, books } = bookshelf;

  return (
    <>
      <VisuallyHidden as="h1">{name}</VisuallyHidden>
      <section aria-label="Books">
        {isSample && <p className={styles.sampleLabel}>Sample entries</p>}
        <ul className={styles.grid} role="list">
          {books.map(
            ({ id, title, author, cover, status, readOn, rating, review }) => (
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
                {(status || readOn || rating !== undefined) && (
                  <p className={styles.meta}>
                    {status && (status !== "Read" || !readOn) && (
                      <span>{status}</span>
                    )}
                    {readOn && (
                      <span>
                        Read{" "}
                        <time dateTime={readOn}>{formatReadDate(readOn)}</time>
                      </span>
                    )}
                    {rating !== undefined && (
                      <span className={styles.rating}>
                        <VisuallyHidden>My rating </VisuallyHidden>
                        <span aria-hidden="true">★</span> {rating}/5
                      </span>
                    )}
                  </p>
                )}
                {review && <ReviewPopover title={title} review={review} />}
              </li>
            ),
          )}
        </ul>
      </section>
    </>
  );
}
