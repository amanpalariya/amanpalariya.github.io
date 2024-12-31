import * as art from "@components/article/Components";
import { PersonalData } from "data";
import { Tooltip } from "@components/ui/tooltip";

const AboutArticle = {
  content: [
    <art.h1>{"It's me, Aman!"}</art.h1>,
    <art.para>{`I am a Software Developer at Oracle. Previously, I had interned at Oracle and before that at Newzera (a robo-journalism startup). The uniqueness comes from my work experience in a large tech company as well as in a startup. I graduated with a bachelor's degree in Computer Science and Engineering from the Indian Institute of Technology Ropar in May 2023. Along with my major, I have a specialization in Artificial Intelligence (AI).`}</art.para>,
    <art.para>{`I find it fascinating to learn what goes behind the world's most influential technologies. I have worked with React, GraphQL, Docker, and Kubernetes in my career which has helped me understand both - the pleasing consumer-facing frontend and the robust backend.`}</art.para>,
    <art.h2>Looking Forward</art.h2>,
    <art.para>
      {`I want to explore the world of entrepreneurship. I'm passionate about tech, education, linguistics, and social causes. At Oracle, I often take part in volunteering activities available to me. If you have any projects or opportunities in tech and education, feel free to reach out on `}{" "}
      <art.link url={PersonalData.linkedIn.url} isExternal>
        LinkedIn
      </art.link>{" "}
      {` or send me an `}
      <Tooltip content={PersonalData.email} closeOnScroll>
        <span>
          <art.link url={`mailto:${PersonalData.email}`} isExternal>
            email
          </art.link>
        </span>
      </Tooltip>
      {`.`}
    </art.para>,
  ],
};

export default AboutArticle;
