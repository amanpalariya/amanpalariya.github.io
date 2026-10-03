import { Avatar } from "@components/ui/avatar";
import { PersonalData, WorkData } from "data";
import TimeBasedOnlineStatusBadge from "./TimeBasedOnlineStatusBadge";
import CopyEmailButton from "../common/CopyEmailSecondaryButton";
import LinkedInButton from "../common/LinkedInPrimaryButton";

export default function Profile() {
  return (
    <section className="home-intro" aria-labelledby="home-name">
      <div className="home-intro-label">
        <span>{WorkData.current.role}</span>
        <TimeBasedOnlineStatusBadge />
      </div>
      <div className="home-identity-row">
        <div>
          <h1 id="home-name">I&apos;m {PersonalData.name.full}</h1>
          <p>{PersonalData.intro.short}</p>
        </div>
        <Avatar
          className="home-portrait"
          src={PersonalData.avatar.url}
          name={PersonalData.name.full}
          boxSize="88px"
          flexShrink={0}
        />
      </div>
      <div className="home-actions">
        <LinkedInButton />
        <CopyEmailButton />
      </div>
    </section>
  );
}
