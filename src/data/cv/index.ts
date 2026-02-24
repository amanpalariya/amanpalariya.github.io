export interface CvProfile {
  name: string;
  headline: string;
  summary: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  links?: Array<{ label: string; url: string }>;
}

export interface CvSectionBase {
  id: string;
  title: string;
  description?: string;
}

export interface CvTimelineItem {
  title: string;
  organization: string;
  location?: string;
  start: string;
  end?: string;
  summary?: string;
  highlights?: string[];
  tags?: string[];
  logoSrc?: string;
  url?: string;
}

export interface CvSkillGroup {
  group: string;
  items: Array<{
    name: string;
    level?: "beginner" | "intermediate" | "advanced" | "expert";
    notes?: string;
  }>;
}

export interface CvProjectItem {
  name: string;
  summary: string;
  url?: string;
  highlights?: string[];
  tags?: string[];
}

export interface CvVolunteeringItem {
  role: string;
  organization: string;
  start: string;
  end?: string;
  summary?: string;
  highlights?: string[];
}

export interface CvEducationItem {
  degree: string;
  institution: string;
  location?: string;
  start: string;
  end?: string;
  summary?: string;
  highlights?: string[];
}

export interface CvAwardItem {
  title: string;
  issuer?: string;
  date?: string;
  summary?: string;
}

export interface CvPublicationItem {
  title: string;
  venue?: string;
  date?: string;
  url?: string;
  summary?: string;
}

export interface CvData {
  profile: CvProfile;
  sections: {
    summary?: CvSectionBase & { content: string };
    experience?: CvSectionBase & { items: CvTimelineItem[] };
    projects?: CvSectionBase & { items: CvProjectItem[] };
    skills?: CvSectionBase & { items: CvSkillGroup[] };
    education?: CvSectionBase & { items: CvEducationItem[] };
    volunteering?: CvSectionBase & { items: CvVolunteeringItem[] };
    awards?: CvSectionBase & { items: CvAwardItem[] };
    publications?: CvSectionBase & { items: CvPublicationItem[] };
  };
}

const CvData: CvData = {
  profile: {
    name: "Aman Palariya",
    headline: "Software Developer at Oracle · AI-focused CS graduate",
    summary:
      "I build reliable, user-focused software with clean architecture, thoughtful UX, and practical AI. I like turning complex requirements into clear workflows and steady execution.",
    location: "Bengaluru, India",
    email: "aman.palariya@gmail.com",
    website: "https://amanpalariya.github.io",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/amanpalariya" },
      { label: "GitHub", url: "https://github.com/amanpalariya" },
      { label: "X", url: "https://x.com/AmanPalariya" },
    ],
  },
  sections: {
    experience: {
      id: "experience",
      title: "Experience",
      description: "Roles with measurable product and platform impact.",
      items: [
        {
          title: "Software Developer",
          organization: "Oracle",
          location: "Bengaluru, India",
          start: "Jun 2023",
          end: "Present",
          summary: "Building developer-facing tooling and streamlining workflows.",
          highlights: [
            "Shipped productivity-focused UI improvements for daily workflows.",
            "Partnered cross-functionally to align roadmap scope and constraints.",
          ],
          tags: ["React", "TypeScript", "Design Systems"],
          logoSrc: "/images/logo/oracle.svg",
          url: "https://www.oracle.com/",
        },
        {
          title: "Software Developer Intern",
          organization: "Oracle",
          location: "Bengaluru, India",
          start: "Jun 2022",
          end: "Jul 2022",
          summary: "Supported tooling initiatives and shipped UX improvements.",
          highlights: [
            "Built internal dashboards with clear, actionable status indicators.",
          ],
          tags: ["Frontend", "UX"],
          logoSrc: "/images/logo/oracle.svg",
          url: "https://www.oracle.com/",
        },
        {
          title: "Software Developer Intern",
          organization: "Newzera",
          location: "Remote",
          start: "Jan 2021",
          end: "Jan 2021",
          summary: "Prototyped features for media workflows and early product design.",
          highlights: [
            "Improved early-stage UI components for content operations teams.",
          ],
          tags: ["Prototyping", "Product"],
          logoSrc: "/images/logo/newzera.jpeg",
          url: "https://www.newzera.com/",
        },
      ],
    },
    projects: {
      id: "projects",
      title: "Selected Projects",
      description: "Developer tools, learning, and automation work.",
      items: [
        {
          name: "Personal Knowledge Hub",
          summary:
            "A fast, searchable workspace for notes, writing, and documentation.",
          highlights: [
            "Designed modular content blocks to scale across topics.",
          ],
          tags: ["Next.js", "Content"],
          url: "https://amanpalariya.github.io",
        },
        {
          name: "Developer Utilities",
          summary:
            "CLI-focused tooling to simplify everyday developer workflows.",
          highlights: [
            "Automated repetitive tasks with safe, idempotent commands.",
          ],
          tags: ["Node.js", "Automation"],
        },
      ],
    },
    skills: {
      id: "skills",
      title: "Skills",
      description: "Core technologies and strengths used daily.",
      items: [
        {
          group: "Frontend",
          items: [
            { name: "React", level: "advanced" },
            { name: "TypeScript", level: "advanced" },
            { name: "Next.js", level: "advanced" },
            { name: "Chakra UI", level: "advanced" },
          ],
        },
        {
          group: "Backend & Data",
          items: [
            { name: "Node.js", level: "advanced" },
            { name: "REST APIs", level: "advanced" },
            { name: "SQL", level: "intermediate" },
            { name: "Python", level: "intermediate" },
          ],
        },
        {
          group: "Practices",
          items: [
            { name: "System Design", level: "intermediate" },
            { name: "Documentation", level: "advanced" },
            { name: "Mentoring", level: "intermediate" },
          ],
        },
      ],
    },
    education: {
      id: "education",
      title: "Education",
      items: [
        {
          degree: "B.Tech in Computer Science (AI specialization)",
          institution: "IIT Ropar",
          location: "Rupnagar, India",
          start: "2019",
          end: "2023",
          highlights: ["Focused on AI, ML, and software engineering fundamentals."],
        },
      ],
    },
  },
};

export default CvData;