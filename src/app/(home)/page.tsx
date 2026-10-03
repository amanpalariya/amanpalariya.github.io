"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { Avatar } from "@components/ui/avatar";
import Profile from "@components/page/home/Profile";
import LinkedInButton from "@components/page/common/LinkedInPrimaryButton";
import CopyEmailButton from "@components/page/common/CopyEmailSecondaryButton";
import ProjectsData from "data/projects";
import { homepageTabs } from "app/route-info";
import { WorkData } from "data";
import type { WorkExperience } from "data/Work";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import "./home.css";

function ExternalArrow() {
  return (
    <svg
      className="home-external-arrow"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 15L18 6M8 6H18V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeedRow({
  href,
  external = false,
  children,
}: {
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const content = (
    <>
      {children}
      {external && href ? <ExternalArrow /> : null}
    </>
  );
  return href ? (
    <NextLink
      className="home-feed-row"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {content}
      {external ? (
        <span className="home-sr-only"> (opens in a new tab)</span>
      ) : null}
    </NextLink>
  ) : (
    <div className="home-feed-row">{content}</div>
  );
}

function getTimeStringFromExp(exp: WorkExperience) {
  const formatDate = (date: Date | null) =>
    date
      ? new Intl.DateTimeFormat("en", {
          year: "numeric",
          month: "short",
        }).format(date)
      : "Present";
  const start = formatDate(exp.time.start);
  const end = formatDate(exp.time.end);
  return start === end ? start : `${start} - ${end}`;
}

export default function Home() {
  const [forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return (
    <div className="home-feed">
      <Profile />

      <section aria-labelledby="home-experience-heading">
        <header className="home-section-heading">
          <h2 id="home-experience-heading">Work Experience</h2>
        </header>
        {forceEmptyStates ? (
          <p className="home-empty">{WorkData.emptyStateTitle}</p>
        ) : (
          <ul className="home-feed-list">
            {WorkData.experience.map((exp, index) => (
              <li key={`${exp.company.name}-${index}`}>
                <FeedRow href={exp.url} external>
                  <Avatar
                    aria-hidden="true"
                    className="home-company-avatar"
                    name={exp.company.name}
                    src={exp.company.logoSrc}
                    boxSize="40px"
                    flexShrink={0}
                  />
                  <div className="home-row-content">
                    <div className="home-row-title">{exp.company.name}</div>
                    <p>{exp.role}</p>
                    <div className="home-row-meta">
                      {getTimeStringFromExp(exp)}
                    </div>
                  </div>
                </FeedRow>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="home-projects-heading">
        <header className="home-section-heading">
          <h2 id="home-projects-heading">Projects</h2>
          <NextLink href={homepageTabs.projects.pathname}>View All</NextLink>
        </header>
        {forceEmptyStates || ProjectsData.allProjects.length === 0 ? (
          <p className="home-empty">
            {ProjectsData.projectsPage.emptyStateTitle}
          </p>
        ) : (
          <ul className="home-feed-list">
            {ProjectsData.allProjects.slice(0, 3).map((project, index) => (
              <li key={project.id}>
                <FeedRow
                  href={
                    project.url ??
                    homepageTabs.projects.getSubpagePathname(project.id)
                  }
                  external={Boolean(
                    project.url && !project.url.startsWith("/"),
                  )}
                >
                  <span className="home-project-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="home-row-content">
                    <div className="home-row-title">{project.title}</div>
                    <p>{project.description}</p>
                  </div>
                </FeedRow>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-contact" aria-labelledby="home-contact-heading">
        <h2 id="home-contact-heading">Let&apos;s grow together.</h2>
        <p>Connect with me to talk, work, and share ideas</p>
        <div className="home-actions">
          <LinkedInButton />
          <CopyEmailButton />
        </div>
      </section>
    </div>
  );
}
