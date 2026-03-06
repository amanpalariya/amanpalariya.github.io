import ProjectsClient from "./ProjectsClient";
import { getAllProjects, getProjectIdsWithDetails } from "data/projects/loader";

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
