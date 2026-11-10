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
  const { title, author, cover, readOn, rating, review } = book;
  const face = (
    <span className={styles.face}>
      <span className={styles.cover}>
        <Image
          src={cover}
          alt=""
          width={240}
          height={360}
          unoptimized
          className={styles.coverArt}
        />
        {rating !== undefined && (
          <span className={styles.coverBadge}>
            <VisuallyHidden>My rating </VisuallyHidden>
            <span aria-hidden="true">★</span> {rating}/5
          </span>
        )}
      </span>
      <span>
        <span className={styles.title}>{title}</span>
        <span className={styles.author}>{author}</span>
      </span>
    </span>
  );

  return (
    <li>
      {readOn || review ? (
        <CoverDetails title={title} face={face}>
          {readOn && (
            <p>
              Read <time dateTime={readOn}>{formatReadDate(readOn)}</time>
            </p>
          )}
          {review && <p className={styles.review}>{review}</p>}
        </CoverDetails>
      ) : (
        face
      )}
    </li>
  );
}

function BookSection({
  id,
  title,
  books,
  compact = false,
}: {
  id: string;
  title: string;
  books: Book[];
  compact?: boolean;
}) {
  if (books.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <Heading2 id={id} mb={3}>
        {title}
      </Heading2>
      <ul className={compact ? styles.readingGrid : styles.grid} role="list">
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
  const wantToRead = books.filter((book) => book.status === "Want to read");
  const finished = books
    .filter((book) => book.status === "Read" || book.status === undefined)
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
            compact
          />
          <BookSection id="finished" title="Finished" books={finished} />
          <BookSection
            id="want-to-read"
            title="Want to read"
            books={wantToRead}
          />
        </div>
      </section>
    </>
  );
}
