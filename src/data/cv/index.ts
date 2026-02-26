import PersonalData from "../Personal";

/**
 * Canonical CV date input format.
 *
 * Allowed values (ISO-like):
 * - YYYY
 * - YYYY-MM
 * - YYYY-MM-DD
 *
 * Date ranges are modeled by separate `start` and `end` fields.
 * If `end` is omitted, the role/entry is considered ongoing and the renderer may
 * show `Present` for timeline-like sections.
 */
export type CvDateString = string;

export interface CvProfile {
  name: string;
  headline: string;
  summary: string;
  focusAreas?: string[];
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  links?: Array<{ label: string; url: string }>;
}

export interface CvSectionVisibility {
  enabled: boolean;
  defaultExpanded?: boolean;
  priority?: number;
}

export interface CvSectionBase {
  id: string;
  title: string;
  description?: string;
  visibility?: CvSectionVisibility;
}

export interface CvTimelineItem {
  title: string;
  organization: string;
  location?: string;
  start: CvDateString;
  end?: CvDateString;
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
  isFeatured?: boolean;
  highlight?: string;
  url?: string;
  highlights?: string[];
  tags?: string[];
}

export interface CvVolunteeringItem {
  role: string;
  organization: string;
  start: CvDateString;
  end?: CvDateString;
  summary?: string;
  highlights?: string[];
}

export interface CvEducationItem {
  degree: string;
  institution: string;
  location?: string;
  start: CvDateString;
  end?: CvDateString;
  summary?: string;
  highlights?: string[];
}

export interface CvAwardItem {
  title: string;
  issuer?: string;
  date?: CvDateString;
  summary?: string;
}

export interface CvPublicationItem {
  title: string;
  venue?: string;
  date?: CvDateString;
  url?: string;
  summary?: string;
}

export interface CvCertificationItem {
  title: string;
  issuer?: string;
  date?: CvDateString;
  credentialUrl?: string;
  summary?: string;
  tags?: string[];
}

export interface CvLanguageItem {
  name: string;
  nativeName?: string;
  proficiency?: "basic" | "professional" | "native";
}

export interface CvCourseItem {
  name: string;
  institution?: string;
  date?: CvDateString;
  timeframe?: string;
  grade?: string;
}

export interface CvOrganizationItem {
  name: string;
  role?: string;
  start?: CvDateString;
  end?: CvDateString;
  summary?: string;
}

export interface CvContactChannel {
  label: string;
  value: string;
  url?: string;
  iconKey?: "email" | "linkedin" | "github" | "website" | "phone" | "location";
}

export interface CvRecommendationItem {
  author: string;
  role?: string;
  text: string;
  date?: CvDateString;
}

export type CvCollectionSection<T> = CvSectionBase & { items: T[] };

export interface CvData {
  profile: CvProfile;
  sections: {
    summary?: CvSectionBase & { content: string };
    about?: CvSectionBase & { content: string };
    openTo?: CvSectionBase & { roles: string[]; visibilityNote?: string };
    experience?: CvCollectionSection<CvTimelineItem>;
    projects?: CvCollectionSection<CvProjectItem>;
    skills?: CvCollectionSection<CvSkillGroup>;
    education?: CvCollectionSection<CvEducationItem>;
    volunteering?: CvCollectionSection<CvVolunteeringItem>;
    awards?: CvCollectionSection<CvAwardItem>;
    publications?: CvCollectionSection<CvPublicationItem>;
    certifications?: CvCollectionSection<CvCertificationItem>;
    languages?: CvCollectionSection<CvLanguageItem>;
    courses?: CvCollectionSection<CvCourseItem>;
    organizations?: CvCollectionSection<CvOrganizationItem>;
    contact?: CvCollectionSection<CvContactChannel>;
    recommendations?: CvCollectionSection<CvRecommendationItem>;
  };
}

const sharedProfileLinks: NonNullable<CvProfile["links"]> = [
  { label: "LinkedIn", url: PersonalData.linkedIn.url },
  { label: "GitHub", url: PersonalData.github.url },
  { label: "X", url: PersonalData.twitter.url },
];

const sharedContactChannels: CvContactChannel[] = [
  {
    label: "Email",
    value: PersonalData.email,
    url: `mailto:${PersonalData.email}`,
    iconKey: "email",
  },
  {
    label: "Phone",
    value: PersonalData.phone,
    url: "tel:+917535015290",
    iconKey: "phone",
  },
  {
    label: "LinkedIn",
    value: `linkedin.com/in/${PersonalData.linkedIn.username}`,
    url: PersonalData.linkedIn.url,
    iconKey: "linkedin",
  },
  {
    label: "GitHub",
    value: `github.com/${PersonalData.github.username}`,
    url: PersonalData.github.url,
    iconKey: "github",
  },
  {
    label: "Website",
    value: PersonalData.website.replace(/^https?:\/\//, ""),
    url: PersonalData.website,
    iconKey: "website",
  },
];

const workLocation =
  PersonalData.locations?.work?.display ?? "Bengaluru, Karnataka, India";

const CvData: CvData = {
  profile: {
    name: PersonalData.name.full,
    headline:
      "Software Engineer @ Oracle ·  CS graduate (AI specialization) @ IIT Ropar",
    summary:
      "I work on Oracle Integration, building backend-heavy platform capabilities across Java, Python, Docker, and Kubernetes. I have shipped features end-to-end, led high-severity issue resolution with customers, and regularly improve CI/CD and development workflows. I hold a B.Tech in Computer Science from IIT Ropar with specialization in AI, and I enjoy mentoring and teaching alongside engineering work.",
    focusAreas: [
      "Backend Engineering",
      "Platform Reliability",
      "Developer Experience",
      "AI-first Workflows",
    ],
    location: workLocation,
    email: PersonalData.email,
    phone: PersonalData.phone,
    website: PersonalData.website,
    links: sharedProfileLinks,
  },
  sections: {
    about: {
      id: "about",
      title: "About",
      description: "A concise profile summary focused on engineering impact.",
      visibility: { enabled: false, priority: 1 },
      content:
        "I work on Oracle Integration, building backend-heavy platform capabilities across Java, Python, Docker, and Kubernetes. I have shipped features end-to-end, led high-severity issue resolution with customers, and regularly improve CI/CD and development workflows. I hold a B.Tech in Computer Science from IIT Ropar with specialization in AI, and I enjoy mentoring and teaching alongside engineering work.",
    },
    openTo: {
      id: "open-to",
      title: "Open to",
      description: "Current job-interest profile.",
      visibility: { enabled: false, priority: 2 },
      roles: [
        "Software Engineer",
        "System Engineer",
        "Member of Technical Staff",
        "Graduate Software Engineer",
      ],
      visibilityNote: "Visible to recruiters",
    },
    experience: {
      id: "experience",
      title: "Experience",
      description:
        "Roles with measurable product, reliability, and delivery impact.",
      visibility: { enabled: true, priority: 3 },
      items: [
        {
          title: "Senior Member of Technical Staff",
          organization: "Oracle",
          start: "2025-09",
          location: workLocation,
          highlights: [
            "Designed and implemented Kubernetes deployment optimization framework saving ~$2.56M annually (patentable candidate).",
            "Led end-to-end resolution of 10+ high-severity product issues with customer coordination, root-cause analysis, cross-team communication, and deployment ownership.",
            "Drove AI-first quality tooling including internal MCP servers, increasing code coverage by ~50% and saving 5–10 developer hours weekly.",
          ],
          tags: ["Java", "Python", "AI Tooling", "Production Support"],
          logoSrc: "/images/logo/oracle.svg",
          url: "https://www.oracle.com/",
        },
        {
          title: "Member of Technical Staff",
          organization: "Oracle",
          location: workLocation,
          start: "2023-06",
          end: "2025-10",
          highlights: [
            "Led development of high-demand adapters (File, FTP, Stage), adding SSH/FTP and PGP encryption/decryption capabilities.",
            "Built FHIR-compliant healthcare components including secure SMART on FHIR integration.",
            "Architected CI/CD improvements cutting build duration by ~75% (2h to 30m).",
          ],
          tags: ["Kubernetes", "Integration", "FHIR", "CI/CD"],
          logoSrc: "/images/logo/oracle.svg",
          url: "https://www.oracle.com/",
        },
        {
          title: "Project Intern - Member of Technical Staff",
          organization: "Oracle",
          location: workLocation,
          start: "2022-06",
          end: "2022-07",
          highlights: [
            "Delivered OAuth and REST-based communication framework with test coverage and real-world use case in under two months.",
          ],
          tags: ["OCI", "OAuth", "REST APIs"],
          logoSrc: "/images/logo/oracle.svg",
          url: "https://www.oracle.com/",
        },
        {
          title: "Project Member",
          organization: "IPSA Labs, IIT Ropar",
          location: "Rupnagar, Punjab, India",
          start: "2022-01",
          end: "2022-05",
          highlights: [
            "Collaborated with district officers to gather constraints and deliver usable workflows.",
            "System was used by 1200+ Anganwadi workers across five blocks in Rupnagar district.",
          ],
          tags: ["Social Impact", "Product Engineering"],
        },
        {
          title: "Subject Matter Expert",
          organization: "Chegg India",
          start: "2021-11",
          end: "2022-03",
          highlights: ["Mentored and supported computer science learners."],
          tags: ["Teaching", "Computer Science"],
          url: "https://www.chegg.com/",
        },
        {
          title: "Coordinator",
          organization: "Software Community, IIT Ropar",
          start: "2020-12",
          end: "2021-12",
          highlights: [
            "Coordinated technical initiatives and student development programs.",
          ],
          tags: ["Leadership", "Community"],
        },
        {
          title: "Software Engineering Intern",
          organization: "Newzera",
          location: "Indore, Madhya Pradesh, India",
          start: "2021-01",
          end: "2021-02",
          highlights: [
            "Implemented GraphQL APIs in JavaScript with high-coverage unit tests and documentation.",
          ],
          tags: ["GraphQL", "JavaScript", "Backend"],
          logoSrc: "/images/logo/newzera.jpeg",
          url: "https://www.newzera.com/",
        },
      ],
    },
    projects: {
      id: "projects",
      title: "Projects",
      description: "Selected engineering and academic projects.",
      visibility: { enabled: true, priority: 4 },
      items: [
        {
          name: "SAMPAN App",
          summary:
            "A social-sector app and dashboard to improve Anganwadi operations with district-level usage.",
          isFeatured: true,
          highlight: "Impact",
          highlights: [
            "Developed in association with CDPOs and DC Rupnagar to support 1200+ Anganwadi workers.",
            "Enabled logging of 50K+ data entries per month.",
          ],
          tags: ["Flutter", "Mobile + Dashboard", "Social Impact"],
        },
        {
          name: "Console Game Language",
          summary:
            "Designed a new language, compiler, and runtime for retro controller-based games.",
          isFeatured: true,
          highlights: [
            "Built a RegEx-based lexical analyzer and LR(0) parser.",
            "Implemented runtime model for a 6-button controller environment.",
          ],
          tags: ["Compiler", "Python", "Language Design"],
          url: "https://github.com/amanpalariya",
        },
        {
          name: "32-bit RISC-V ISA Simulator",
          summary:
            "Academic systems project implementing instruction-level simulation for the RISC-V ISA.",
          isFeatured: true,
          highlight: "Systems",
          highlights: [
            "Implemented 29 RISC-V instructions across arithmetic, logical, data, and control categories.",
            "Added pipelined and non-pipelined execution, L1/L2 memory hierarchy, branch prediction, and hazard detection.",
          ],
          tags: ["Computer Architecture", "Simulation", "Python"],
          url: "https://github.com/amanpalariya",
        },
        {
          name: "Rain/snow generation and removal from videos",
          summary:
            "Computer vision experimentation on weather artifact synthesis and removal.",
          highlight: "AI",
          tags: ["Computer Vision", "Image Processing"],
        },
        {
          name: "Academic Portal",
          summary: "Workflow-focused portal for academic operations.",
          tags: ["Web", "Portal"],
        },
        {
          name: "OS Components",
          summary: "Core operating-systems coursework implementation project.",
          tags: ["Operating Systems", "Systems Programming"],
        },
        {
          name: "Personal Website",
          summary: "Content-first portfolio built with Next.js and Chakra UI.",
          isFeatured: true,
          highlight: "DX",
          highlights: [
            "Designed reusable component architecture with strong visual consistency.",
          ],
          tags: ["Next.js", "TypeScript", "Chakra UI"],
          url: "https://amanpalariya.github.io",
        },
      ],
    },
    skills: {
      id: "skills",
      title: "Skills",
      description:
        "Programming languages, platforms, tools, and engineering practices.",
      visibility: { enabled: true, priority: 11 },
      items: [
        {
          group: "Programming Languages",
          items: [
            { name: "Java", level: "expert" },
            { name: "Python", level: "advanced" },
            { name: "Bash", level: "advanced" },
            { name: "JavaScript/TypeScript", level: "advanced" },
            { name: "C/C++", level: "intermediate" },
          ],
        },
        {
          group: "Frameworks & Tools",
          items: [
            { name: "Linux", level: "advanced" },
            { name: "Git", level: "advanced" },
            { name: "Kubernetes", level: "advanced" },
            { name: "Docker", level: "advanced" },
            { name: "Node.js", level: "advanced" },
            { name: "React", level: "advanced" },
            { name: "Oracle Cloud", level: "advanced" },
            { name: "Vi/Neovim", level: "advanced" },
          ],
        },
        {
          group: "Engineering Practices",
          items: [
            { name: "API Development", level: "advanced" },
            { name: "CI/CD", level: "advanced" },
            { name: "Generative AI", level: "advanced" },
            { name: "Documentation", level: "advanced" },
            { name: "Agile Methodologies", level: "advanced" },
          ],
        },
      ],
    },
    education: {
      id: "education",
      title: "Education",
      visibility: { enabled: true, priority: 12 },
      items: [
        {
          degree: "B.Tech in Computer Science (AI specialization)",
          institution: "IIT Ropar",
          location: "Rupnagar, India",
          start: "2019",
          end: "2023",
          summary: "Grade: 9.17 GPA, concentration in AI with 10.0 GPA",
          highlights: [
            "Focused on AI, ML, computer vision, reinforcement learning, and software engineering fundamentals.",
          ],
        },
        {
          degree: "CBSE Grade-12 (Mathematics)",
          institution: "Inspiration Senior Secondary School",
          start: "2018",
          end: "2019",
          summary: "Grade: 96.60%",
        },
      ],
    },
    volunteering: {
      id: "volunteering",
      title: "Volunteer Experience",
      description: "Community and mentoring contributions.",
      visibility: { enabled: false, priority: 13 },
      items: [
        {
          role: "Technical Mentor",
          organization: "Student engineering circles",
          start: "2020",
          summary:
            "Mentoring students entering software engineering and interview preparation.",
        },
      ],
    },
    certifications: {
      id: "certifications",
      title: "Certifications",
      description: "Professional and platform credentials.",
      visibility: { enabled: false, priority: 14 },
      items: [
        {
          title: "Oracle Certified AI Foundations Associate",
          issuer: "Oracle",
          tags: ["AI"],
        },
        {
          title: "Oracle Certified Generative AI Professional",
          issuer: "Oracle",
          tags: ["GenAI"],
        },
        {
          title: "Oracle Certified OCI Foundations Associate",
          issuer: "Oracle",
          tags: ["OCI"],
        },
        {
          title: "Oracle Certified Application Integration Professional",
          issuer: "Oracle",
          tags: ["Integration"],
        },
        {
          title: "Kubernetes",
          issuer: "LinkedIn",
          tags: ["Cloud Native"],
        },
      ],
    },
    languages: {
      id: "languages",
      title: "Languages",
      visibility: { enabled: true, priority: 15 },
      items: [
        { name: "English", nativeName: "English", proficiency: "professional" },
        { name: "Hindi", nativeName: "हिन्दी", proficiency: "native" },
        { name: "Spanish", nativeName: "Español", proficiency: "basic" },
      ],
    },
    courses: {
      id: "courses",
      title: "Courses",
      visibility: { enabled: false, priority: 16 },
      items: [
        { name: "Data Structures", institution: "IIT Ropar" },
        { name: "Computer Architecture", institution: "IIT Ropar" },
        { name: "Linear Algebra", institution: "IIT Ropar" },
        { name: "Probability and Statistics", institution: "IIT Ropar" },
        { name: "Signals and Systems", institution: "IIT Ropar" },
      ],
    },
    awards: {
      id: "honors",
      title: "Honors",
      visibility: { enabled: true, priority: 17 },
      items: [
        {
          title: "Codeforces Expert",
          issuer: "Codeforces",
          date: "",
          summary:
            "Rating 1725; solved 1500+ programming problems across platforms.",
        },
        {
          title: "Institute Merit Scholar",
          issuer: "Indian Institute of Technology Ropar",
          date: "2022-05",
        },
        {
          title: "Best B.Tech Project Award",
          issuer: "IIT Ropar (National Technology Day)",
          date: "2022-05",
        },
        {
          title: "ICPC Asia Amritapuri Site",
          issuer: "ICPC",
          date: "2021-10",
          summary: "Secured 156th rank in prelims and 530th rank in regionals.",
        },
        {
          title: "Google Hash Code",
          issuer: "Google",
          date: "2021-02",
          summary: "Secured 18th rank in India and 198th rank globally.",
        },
        {
          title: "JEE Advanced",
          issuer: "India",
          date: "2019-05",
          summary: "Secured All India Rank 1910 among 150K+ candidates.",
        },
      ],
    },
    organizations: {
      id: "organizations",
      title: "Organizations",
      visibility: { enabled: false, priority: 18 },
      items: [
        {
          name: "SoftCom",
          role: "Coordinator",
          start: "2020-12",
          summary: "Software community leadership and technical mentoring.",
        },
      ],
    },
    contact: {
      id: "contact",
      title: "Contact",
      description: "Direct channels for collaboration and outreach.",
      visibility: { enabled: true, priority: 19 },
      items: sharedContactChannels,
    },
    recommendations: {
      id: "recommendations",
      title: "Recommendations",
      description: "Peer and stakeholder feedback.",
      visibility: { enabled: false, priority: 20 },
      items: [],
    },
    publications: {
      id: "publications",
      title: "Publications",
      visibility: { enabled: false, priority: 21 },
      items: [],
    },
    summary: {
      id: "profile-summary",
      title: "Summary",
      visibility: { enabled: false, priority: 22 },
      content:
        "Cross-functional software engineer focused on product reliability, platform quality, and practical AI enablement.",
    },
  } as CvData["sections"],
};

export default CvData;
