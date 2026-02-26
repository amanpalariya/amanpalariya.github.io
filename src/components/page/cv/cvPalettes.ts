import type { AppAccentPalette } from "theme/colors/types";

export type CvSectionId =
  | "about"
  | "open-to"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "volunteering"
  | "certifications"
  | "languages"
  | "courses"
  | "honors"
  | "organizations"
  | "contact";

export const CV_SECTION_ACCENTS: Record<CvSectionId, AppAccentPalette> = {
  about: "blue",
  "open-to": "purple",
  experience: "blue",
  projects: "purple",
  skills: "green",
  education: "orange",
  volunteering: "green",
  certifications: "blue",
  languages: "orange",
  courses: "yellow",
  honors: "red",
  organizations: "purple",
  contact: "blue",
};

export function getCvSectionPalette(sectionId: CvSectionId): AppAccentPalette {
  return CV_SECTION_ACCENTS[sectionId];
}

export function getCvSectionPaletteUnsafe(sectionId: string): AppAccentPalette {
  if (sectionId in CV_SECTION_ACCENTS) {
    return CV_SECTION_ACCENTS[sectionId as CvSectionId];
  }

  return "blue";
}
