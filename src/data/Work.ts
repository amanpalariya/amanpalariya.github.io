import PersonalData from "./Personal";

interface Location {
  city: string;
  state: string;
  stateShort: string;
  country: string;
  countryShort: string;
  isRemote: boolean;
}

interface Company {
  name: string;
  websiteUrl?: string;
  logoSrc?: string;
}

export interface WorkExperience {
  role: string;
  company: Company;
  email: string;
  url?: string;
  location: Location;
  time: {
    start: Date;
    end: Date | null;
  };
}

const currentWork: WorkExperience = {
  role: "Software Engineer 2",
  company: {
    name: "Rippling",
    logoSrc: "/images/logo/rippling.svg",
    websiteUrl: "https://www.rippling.com/",
  },
  email: PersonalData.email,
  location: {
    city: "Bengaluru",
    state: "Karnataka",
    stateShort: "KA",
    country: "India",
    countryShort: "IN",
    isRemote: false,
  },
  time: {
    start: new Date("2026-07-01"),
    end: null,
  },
};

const WorkData: {
  current: WorkExperience;
  experience: WorkExperience[];
  emptyStateTitle: string;
} = {
  emptyStateTitle: "There is no work experience yet!",
  current: currentWork,
  experience: [
    { ...currentWork, url: currentWork.company.websiteUrl },
    {
      role: "Software Developer",
      company: {
        name: "Oracle",
        websiteUrl: "https://www.oracle.com/",
        logoSrc: "/images/logo/oracle.svg",
      },
      email: "aman.palariya@oracle.com",
      url: "https://www.oracle.com/",
      location: {
        city: "Bengaluru",
        state: "Karnataka",
        stateShort: "KA",
        country: "India",
        countryShort: "IN",
        isRemote: false,
      },
      time: {
        start: new Date("2023-06-20"),
        end: new Date("2026-07-01"),
      },
    },
  ],
};

export default WorkData;
