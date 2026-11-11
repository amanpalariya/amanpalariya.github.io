"use client";

import { Heading2 } from "@components/core/Texts";
import ContentSection from "@components/page/common/ContentSection";
import {
  Button,
  EmptyState,
  Skeleton,
  SkeletonText,
  Spinner,
  VisuallyHidden,
} from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { FiBookOpen, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { LuCircleAlert, LuLibraryBig } from "react-icons/lu";
import type { Book, BookGroups } from "data/bookshelf";
import FeatureFlagsData from "data/features";
import {
  useBookshelf,
  type BookshelfErrorReason,
} from "@features/bookshelf/hooks/useBookshelf";
import { useFeatureFlag } from "utils/features";
import CoverDetails from "./CoverDetails";
import styles from "./bookshelf.module.css";

const bookshelfSections = [
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

function BookshelfStateIcon({ error = false }: { error?: boolean }) {
  return (
    <span className={styles.stateIcon} aria-hidden="true">
      <LuLibraryBig />
      {error && <LuCircleAlert className={styles.stateBadge} />}
    </span>
  );
}

function EmptyBookshelf() {
  return (
    <EmptyState.Root as="section" aria-label="Books" px={0}>
      <EmptyState.Content gap={4}>
        <EmptyState.Indicator color="app.fg.subtle" aria-hidden="true">
          <BookshelfStateIcon />
        </EmptyState.Indicator>
        <EmptyState.Title as="h2" color="app.prose.heading" textAlign="center">
          The bookshelf is empty
        </EmptyState.Title>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

function BookSections({ groups }: { groups: BookGroups }) {
  const visibleSections = bookshelfSections.filter(
    ({ section }) => groups[section].length > 0,
  );

  if (visibleSections.length === 0) {
    return <EmptyBookshelf />;
  }

  return (
    <section aria-label="Books">
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

function BookshelfLoading() {
  return (
    <div className={styles.sections} aria-hidden="true">
      <div>
        <Skeleton width="9rem" height="26px" mb={3} />
        <div className={styles.featuredBook}>
          <div className={styles.face}>
            <div className={styles.cover}>
              <Skeleton position="absolute" inset={0} />
            </div>
            <div className={styles.caption}>
              <Skeleton width="full" maxW="13rem" height="7" mb={2} />
              <Skeleton width="6rem" maxW="full" height="3" />
            </div>
          </div>
        </div>
      </div>
      <ContentSection>
        <Skeleton width="5rem" height="26px" mb={3} />
        <div className={`${styles.grid} ${styles.loadingGrid}`}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className={styles.cover}>
                <Skeleton position="absolute" inset={0} />
              </div>
              <SkeletonText
                noOfLines={2}
                gap="1"
                height="3"
                rootProps={{ mt: 2 }}
              />
            </div>
          ))}
        </div>
      </ContentSection>
    </div>
  );
}

const bookshelfErrorMessages: Record<BookshelfErrorReason, string> = {
  timeout: "The request for the book list timed out.",
  connection:
    "The book list couldn’t be reached. Check your internet connection or try again in a moment.",
  unavailable: "The service that provides the book list returned an error.",
  "invalid-response":
    "The service responded, but this page couldn’t read the book list it sent.",
  unknown: "Something went wrong while fetching the book list.",
};

function BookshelfLoadError({
  message,
  retrying,
  onRetry,
}: {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <EmptyState.Root as="section" aria-labelledby="bookshelf-load-title" px={0}>
      <EmptyState.Content gap={5}>
        <BookshelfStateIcon error={!retrying} />
        <div>
          <Heading2 id="bookshelf-load-title" centerAlign>
            {retrying ? "Loading the bookshelf" : "Couldn’t load the bookshelf"}
          </Heading2>
          <EmptyState.Description
            mt={2}
            mx="auto"
            maxW="36ch"
            textAlign="center"
            color="app.fg.subtle"
          >
            {message}
          </EmptyState.Description>
        </div>
        <Button
          type="button"
          fontFamily="ui"
          fontSize="sm"
          px={2.5}
          shadow="none"
          rounded="full"
          variant="outline"
          background="transparent"
          minW="32"
          aria-disabled={retrying || undefined}
          onClick={onRetry}
        >
          {retrying ? (
            <Spinner size="xs" aria-hidden="true" />
          ) : (
            <FiRefreshCw aria-hidden="true" />
          )}
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

function LiveBookshelf() {
  const { state, retry } = useBookshelf();
  const message =
    state.status === "error"
      ? bookshelfErrorMessages[state.reason]
      : state.status === "retrying"
        ? "Requesting the book list again…"
        : state.status === "loading"
          ? "Loading books…"
          : "Books loaded.";

  return (
    <>
      <VisuallyHidden role="status">{message}</VisuallyHidden>
      {state.status === "loading" ? (
        <BookshelfLoading />
      ) : state.status === "ready" ? (
        <BookSections groups={state.groups} />
      ) : (
        <BookshelfLoadError
          message={message}
          retrying={state.status === "retrying"}
          onRetry={retry}
        />
      )}
    </>
  );
}

export default function Bookshelf() {
  const [forceEmpty] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return forceEmpty ? <EmptyBookshelf /> : <LiveBookshelf />;
}
