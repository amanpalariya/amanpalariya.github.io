import { VisuallyHidden } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { bookshelf } from "data/bookshelf";
import Bookshelf from "./Bookshelf";
import BookshelfPreview from "./BookshelfPreview";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

export default function BookshelfPage() {
  const shelf = <Bookshelf {...bookshelf} />;

  return (
    <>
      <VisuallyHidden as="h1">{name}</VisuallyHidden>
      {process.env.NODE_ENV === "development" ? (
        <Suspense fallback={shelf}>
          <BookshelfPreview>{shelf}</BookshelfPreview>
        </Suspense>
      ) : (
        shelf
      )}
    </>
  );
}
