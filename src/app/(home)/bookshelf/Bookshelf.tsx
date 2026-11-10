"use client";

import { Heading2 } from "@components/core/Texts";
import ContentSection from "@components/page/common/ContentSection";
import { EmptyState, Icon, VisuallyHidden } from "@chakra-ui/react";
import Image from "next/image";
import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import type { Book } from "data/bookshelf";
import FeatureFlagsData from "data/features";
import { useFeatureFlag } from "utils/features";
import CoverDetails from "./CoverDetails";
import styles from "./bookshelf.module.css";

export const bookshelfSections = [
  { status: "Reading", id: "currently-reading", title: "Currently reading" },
  { status: "Want to read", id: "want-to-read", title: "Want to read" },
  { status: "Read", id: "finished", title: "Finished" },
] as const;

export function groupBooks(books: Book[]) {
  return {
    Reading: books.filter((book) => book.status === "Reading"),
    Read: books
      .filter((book) => book.status === "Read" || book.status === undefined)
      .sort((a, b) => (b.readOn ?? "").localeCompare(a.readOn ?? "")),
    "Want to read": books.filter((book) => book.status === "Want to read"),
  };
}

function formatReadDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: value.length > 4 ? "short" : undefined,
    day: value.length > 7 ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

function BookCard({
  book,
  featured = false,
}: {
  book: Book;
  featured?: boolean;
}) {
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
      <span className={styles.caption}>
        <span className={styles.title}>{title}</span>
        <span className={styles.author}>{author}</span>
      </span>
    </span>
  );

  return (
    <li className={featured ? styles.featuredBook : undefined}>
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
  featureFirst = false,
  divided = false,
  collapsible = false,
  startExpanded = false,
}: {
  id: string;
  title: string;
  books: Book[];
  featureFirst?: boolean;
  divided?: boolean;
  collapsible?: boolean;
  startExpanded?: boolean;
}) {
  const list = (
    <ul
      className={styles.grid}
      role="list"
      data-current-count={featureFirst ? books.length : undefined}
    >
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          featured={featureFirst && index === 0}
        />
      ))}
    </ul>
  );

  const content = collapsible ? (
    <details className={styles.sectionDisclosure} open={startExpanded}>
      <summary className={styles.sectionToggle}>
        <Heading2
          id={id}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          minH={8}
        >
          {title}
          <FiChevronDown className={styles.sectionChevron} aria-hidden="true" />
        </Heading2>
      </summary>
      {list}
    </details>
  ) : (
    <>
      <Heading2 id={id} mb={3}>
        {title}
      </Heading2>
      {list}
    </>
  );

  return divided || collapsible ? (
    <ContentSection
      aria-labelledby={id}
      borderBottom={collapsible ? "1px solid var(--site-line)" : undefined}
      pb={collapsible ? 4 : 0}
    >
      {content}
    </ContentSection>
  ) : (
    <section aria-labelledby={id}>{content}</section>
  );
}

export default function Bookshelf({
  books,
  isSample,
  preview = false,
}: {
  books: Book[];
  isSample: boolean;
  preview?: boolean;
}) {
  const [forceEmpty] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  if (books.length === 0 || (forceEmpty && !preview)) {
    return (
      <EmptyState.Root as="section" aria-label="Books" px={0}>
        <EmptyState.Content gap={4}>
          <EmptyState.Indicator color="app.fg.subtle" aria-hidden="true">
            <Icon boxSize={10}>
              <FiBookOpen />
            </Icon>
          </EmptyState.Indicator>
          <EmptyState.Title
            as="h2"
            color="app.prose.heading"
            textAlign="center"
          >
            The bookshelf is empty
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  const groups = groupBooks(books);
  const visibleSections = bookshelfSections.filter(
    ({ status }) => groups[status].length > 0,
  );

  return (
    <section aria-label="Books">
      {isSample && <p className={styles.sampleLabel}>Sample entries</p>}
      <div className={styles.sections}>
        {visibleSections.map(({ status, id, title }, index) => (
          <BookSection
            key={id}
            id={id}
            title={title}
            books={groups[status]}
            featureFirst={status === "Reading"}
            divided={
              index > 0 && visibleSections[index - 1].status !== "Want to read"
            }
            collapsible={status === "Want to read"}
            startExpanded={visibleSections.length === 1}
          />
        ))}
      </div>
    </section>
  );
}
