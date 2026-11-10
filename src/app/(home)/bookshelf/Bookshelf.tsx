"use client";

import { Heading2 } from "@components/core/Texts";
import ContentSection from "@components/page/common/ContentSection";
import { EmptyState, Icon, VisuallyHidden } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { FiBookOpen, FiChevronDown } from "react-icons/fi";
import type { Book, BookGroups } from "data/bookshelf";
import FeatureFlagsData from "data/features";
import { useBookshelf } from "@features/bookshelf/hooks/useBookshelf";
import { useFeatureFlag } from "utils/features";
import CoverDetails from "./CoverDetails";
import styles from "./bookshelf.module.css";

export const bookshelfSections = [
  { section: "reading", id: "currently-reading", title: "Currently reading" },
  { section: "wantToRead", id: "want-to-read", title: "Want to read" },
  { section: "read", id: "finished", title: "Finished" },
] as const;

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
  const [failedCover, setFailedCover] = useState<string>();
  const face = (
    <span className={styles.face}>
      <span className={styles.cover}>
        {cover && cover !== failedCover ? (
          <Image
            src={cover}
            alt=""
            width={240}
            height={360}
            unoptimized
            className={styles.coverArt}
            onError={() => setFailedCover(cover)}
          />
        ) : (
          <span className={styles.coverPlaceholder} aria-hidden="true">
            <FiBookOpen />
          </span>
        )}
        {rating !== undefined && (
          <span className={styles.coverBadge}>
            <VisuallyHidden>My rating </VisuallyHidden>
            <span aria-hidden="true">★</span> {rating}/5
          </span>
        )}
      </span>
      <span className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {author && <span className={styles.author}>{author}</span>}
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
  featureSingle = false,
  divided = false,
  collapsible = false,
  startExpanded = false,
}: {
  id: string;
  title: string;
  books: Book[];
  featureSingle?: boolean;
  divided?: boolean;
  collapsible?: boolean;
  startExpanded?: boolean;
}) {
  const featured = featureSingle && books.length === 1;
  const list = (
    <ul className={styles.grid} role="list">
      {books.map((book) => (
        <BookCard key={book.id} book={book} featured={featured} />
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
  groups,
  isSample = false,
  preview = false,
}: {
  groups: BookGroups;
  isSample?: boolean;
  preview?: boolean;
}) {
  const [forceEmpty] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  const visibleSections = bookshelfSections.filter(
    ({ section }) => groups[section].length > 0,
  );

  if (visibleSections.length === 0 || (forceEmpty && !preview)) {
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

  return (
    <section aria-label="Books">
      {isSample && <p className={styles.sampleLabel}>Sample entries</p>}
      <div className={styles.sections}>
        {visibleSections.map(({ section, id, title }, index) => (
          <BookSection
            key={id}
            id={id}
            title={title}
            books={groups[section]}
            featureSingle={section === "reading"}
            divided={
              index > 0 && visibleSections[index - 1].section !== "wantToRead"
            }
            collapsible={section === "wantToRead"}
            startExpanded={visibleSections.length === 1}
          />
        ))}
      </div>
    </section>
  );
}

export function LiveBookshelf() {
  const state = useBookshelf();

  if (state.status === "ready") return <Bookshelf groups={state.groups} />;

  return (
    <p role="status">
      {state.status === "loading"
        ? "Loading books…"
        : "The bookshelf couldn’t load. Try again later."}
    </p>
  );
}
