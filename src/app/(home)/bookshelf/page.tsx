import { VisuallyHidden } from "@chakra-ui/react";
import Image from "next/image";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { bookshelf, type Book } from "data/bookshelf";
import CoverDetails from "./CoverDetails";
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

function BookCard({ book }: { book: Book }) {
  const { title, author, cover, status, readOn, rating, review } = book;
  const hasRating = rating !== undefined;
  const detailStatus =
    hasRating && (status !== "Read" || !readOn) ? status : undefined;

  return (
    <li>
      <div className={styles.cover}>
        <Image
          src={cover}
          alt=""
          width={240}
          height={360}
          unoptimized
          className={styles.coverArt}
        />
        {(hasRating || status) && (
          <span className={styles.coverBadge}>
            {hasRating ? (
              <>
                <VisuallyHidden>My rating </VisuallyHidden>
                <span aria-hidden="true">★</span> {rating}/5
              </>
            ) : (
              status
            )}
          </span>
        )}
        {(readOn || review || detailStatus) && (
          <CoverDetails title={title}>
            {detailStatus && <p>{detailStatus}</p>}
            {readOn && (
              <p>
                Read <time dateTime={readOn}>{formatReadDate(readOn)}</time>
              </p>
            )}
            {review && <p className={styles.review}>{review}</p>}
          </CoverDetails>
        )}
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.author}>{author}</p>
    </li>
  );
}

export default function BookshelfPage() {
  const { isSample, books } = bookshelf;

  return (
    <>
      <VisuallyHidden as="h1">{name}</VisuallyHidden>
      <section aria-label="Books">
        {isSample && <p className={styles.sampleLabel}>Sample entries</p>}
        <ul className={styles.grid} role="list">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </ul>
      </section>
    </>
  );
}
