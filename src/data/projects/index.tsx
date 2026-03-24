import type { ExternalLink } from "data/external-links";

interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  externalLinks?: ExternalLink[];
}

const allProjects: Project[] = [
  {
    id: "sampan-app",
    title: "SAMPAN",
    description:
      "App that helps CDPOs and 1200+ Anganwadi workers collect data",
    url: "https://sites.google.com/view/goyalpuneet/sampan",
  },
  {
    id: "os-components",
    title: "OS Components",
    description: "Simulation and analysis of different OS services in C",
    url: "https://github.com/amanpalariya/os-components",
  },
  {
    id: "console-game-language",
    title: "Console Game Language",
    description:
      "A new programming language (compiler & runtime) for retro console games",
    url: "/projects/console-game-language",
    externalLinks: [
      {
        label: "Source Code",
        url: "https://github.com/amanpalariya/console-game",
        kind: "code",
      },
      {
        label: "Demo Video",
        url: "https://www.youtube.com/watch?v=okbscpQNZM0",
        kind: "video",
      },
      {
        label: "Language Samples",
        url: "https://github.com/amanpalariya/console-game/tree/main/samples",
        kind: "code",
      },
    ],
  },
  {
    id: "rain-and-snow-removal",
    title: "Rain and Snow Removal from Videos",
    description:
      "Implementation of a rain/snow removal program in Python (works surprisingly well)",
    url: "https://github.com/amanpalariya/rain-and-snow-removal",
  },
  {
    id: "risc-v-simulator",
    title: "32-bit RISC-V Simulator",
    description:
      "Execute machine code stepwise and look into memory, buffers, and cache",
    url: "https://github.com/sagalpreet/RISC-V-Simulator",
  },
];

const ProjectsData = {
  projectsPage: {
    title: "My Works",
    subtitle:
      "Explore some of my exciting projects. Most projects are open source, and I welcome your inquiries for more details or collaboration opportunities.",
  },
  allProjects,
};

export default ProjectsData;
