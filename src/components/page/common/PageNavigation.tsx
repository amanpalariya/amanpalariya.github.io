"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import { getHeaderPageByPathname } from "app/route-info";
import { useDetailBackNavigation } from "@components/page/wrapper/DetailBackNavigation";

export default function PageNavigation({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const goBack = useDetailBackNavigation();
  const page = getHeaderPageByPathname(pathname);
  if (!page) return null;
  const isDetail =
    pathname.replace(/\/$/, "") !== page.pathname.replace(/\/$/, "");
  return (
    <div className={mobile ? "site-mobile-page-title" : "site-page-navigation"}>
      {isDetail && (
        <NextLink
          href={page.pathname}
          className="site-back-button"
          aria-label="Go back"
          onClick={(event) => {
            if (
              !goBack ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            goBack(page.pathname);
          }}
        >
          <FiChevronLeft size={22} aria-hidden="true" />
        </NextLink>
      )}
      <span>{page.title}</span>
    </div>
  );
}
