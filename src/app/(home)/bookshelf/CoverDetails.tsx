"use client";

import type { ReactNode } from "react";
import styles from "./bookshelf.module.css";

function closeDetails(details: HTMLDetailsElement) {
  details.open = false;
  details.querySelector("summary")?.focus({ preventScroll: true });
}

export default function CoverDetails({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const label = `Reading details for ${title}`;

  return (
    <details
      className={styles.disclosure}
      name="bookshelf-reading-details"
      onClick={(event) => {
        if (
          event.target instanceof Element &&
          event.target.closest(`.${styles.coverOverlay}`) &&
          !window.getSelection()?.toString()
        ) {
          closeDetails(event.currentTarget);
        }
      }}
      onKeyDown={(event) => {
        const details = event.currentTarget;
        if (event.key === "Escape" && details.open) {
          event.preventDefault();
          closeDetails(details);
        }
      }}
    >
      <summary className={styles.coverTrigger} aria-label={label} />
      <div className={styles.coverOverlay}>
        <div
          className={styles.detailText}
          role="region"
          aria-label={label}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
    </details>
  );
}
