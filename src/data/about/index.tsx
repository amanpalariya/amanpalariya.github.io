import { PersonalData } from "data";

const AboutArticle = {
  content: [
    { t: "h1", c: "It's me, Aman!" },
    {
      t: "para",
      c: `I am a Software Developer at Oracle. Previously, I had interned at Oracle and before that at Newzera (a robo-journalism startup). The uniqueness comes from my work experience in a large tech company as well as in a startup. I graduated with a bachelor's degree in Computer Science and Engineering from the Indian Institute of Technology Ropar in May 2023. Along with my major, I have a specialization in Artificial Intelligence (AI).`,
    },
    {
      t: "para",
      c: `I find it fascinating to learn what goes behind the world's most influential technologies. I have worked with React, GraphQL, Docker, and Kubernetes in my career which has helped me understand both - the pleasing consumer-facing frontend and the robust backend.`,
    },
    { t: "h2", c: "Looking Forward" },
    {
      t: "para",
      c: [
        `I want to explore the world of entrepreneurship. I'm passionate about tech, education, linguistics, and social causes. At Oracle, I often take part in volunteering activities available to me. If you have any projects or opportunities in tech and education, feel free to reach out on `,
        {
          t: "link",
          url: PersonalData.linkedIn.url,
          isExternal: true,
          c: "LinkedIn",
        },
        ` or send me an `,
        {
          t: "link",
          url: `mailto:${PersonalData.email}`,
          isExternal: true,
          c: "email",
        },
        `.`,
      ],
    },
  ],
};

export default AboutArticle;
