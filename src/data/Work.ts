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

interface WorkExperience {
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

const WorkData: {
  current: WorkExperience;
  experience: WorkExperience[];
} = {
  current: {
    role: "Software Developer",
    company: {
      name: "Oracle",
      websiteUrl: "https://www.oracle.com/",
      logoSrc: "/images/logo/oracle.svg",
    },
    email: "aman.palariya@oracle.com",
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
      end: null,
    },
  },
  experience: [
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
        end: null,
      },
    },
    {
      role: "Software Developer Intern",
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
        isRemote: true,
      },
      time: {
        start: new Date("2022-06-01"),
        end: new Date("2022-07-26"),
      },
    },
    {
      role: "Software Developer Intern",
      company: {
        name: "Newzera",
        websiteUrl: "https://www.linkedin.com/company/newzera/",
        logoSrc: "/images/logo/newzera.jpeg",
      },
      email: "aman.palariya@newzera.com",
      url: "https://www.linkedin.com/company/newzera/",
      location: {
        city: "Indore",
        state: "Madhya Pradesh",
        stateShort: "MP",
        country: "India",
        countryShort: "IN",
        isRemote: true,
      },
      time: {
        start: new Date("2021-01-01"),
        end: new Date("2021-01-01"),
      },
    },
  ],
};

export default WorkData;
