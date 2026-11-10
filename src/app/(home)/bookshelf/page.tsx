import { VisuallyHidden } from "@chakra-ui/react";
import { Heading2 } from "@components/core/Texts";
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
  const displayStatus = status === "Reading" ? undefined : status;
  const detailStatus =
    hasRating && (displayStatus !== "Read" || !readOn)
      ? displayStatus
      : undefined;

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
        {(hasRating || displayStatus) && (
          <span className={styles.coverBadge}>
            {hasRating ? (
              <>
                <VisuallyHidden>My rating </VisuallyHidden>
                <span aria-hidden="true">★</span> {rating}/5
              </>
            ) : (
              displayStatus
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

function BookSection({
  id,
  title,
  books,
}: {
  id: string;
  title: string;
  books: Book[];
}) {
  if (books.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <Heading2 id={id} mb={3}>
        {title}
      </Heading2>
      <ul className={styles.grid} role="list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </ul>
    </section>
  );
}

export default function BookshelfPage() {
  const { isSample, books } = bookshelf;
  const currentlyReading = books.filter((book) => book.status === "Reading");
  const collection = books
    .filter((book) => book.status !== "Reading")
    .sort((a, b) => (b.readOn ?? "").localeCompare(a.readOn ?? ""));

  return (
    <>
      <VisuallyHidden as="h1">{name}</VisuallyHidden>
      <section aria-label="Books">
        {isSample && <p className={styles.sampleLabel}>Sample entries</p>}
        <div className={styles.sections}>
          <BookSection
            id="currently-reading"
            title="Currently reading"
            books={currentlyReading}
          />
          <BookSection
            id="collection"
            title="The collection"
            books={collection}
          />
        </div>
      </section>
    </>
  );
}
