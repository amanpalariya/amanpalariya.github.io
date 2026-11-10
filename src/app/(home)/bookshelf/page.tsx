import { VisuallyHidden } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";
import { sampleBookshelf } from "data/bookshelf";
import { hasAppsScriptUrl } from "../../../services/apps-script";
import Bookshelf, { LiveBookshelf } from "./Bookshelf";
import BookshelfPreview from "./BookshelfPreview";

const { name } = homepageTabs.bookshelf;

export const metadata: Metadata = {
  title: getPageTitle(name),
};

export default function BookshelfPage() {
  const shelf = hasAppsScriptUrl ? (
    <LiveBookshelf />
  ) : (
    <Bookshelf groups={sampleBookshelf} isSample />
  );

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
