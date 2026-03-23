import ProjectsClient from "./ProjectsClient";
import { getAllProjects, getProjectIdsWithDetails } from "data/projects/loader";
import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { homepageTabs } from "app/route-info";

export const metadata: Metadata = {
  title: getPageTitle(homepageTabs.projects.name),
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const projectIdsWithDetails = getProjectIdsWithDetails();
  return (
    <ProjectsClient
      projects={projects}
      projectIdsWithDetails={projectIdsWithDetails}
    />
  );
}
