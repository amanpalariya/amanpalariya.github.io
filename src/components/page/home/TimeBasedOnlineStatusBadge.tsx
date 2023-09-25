import { useBreakpointValue } from "@chakra-ui/react";
import { StatusBadge } from "@components/core/Badges";
import { PersonalData } from "data";

function isOnline(wakeupHour: number = 6, sleepHour: number = 22) {
  const istOptions = {
    timeZone: PersonalData.location.timeZone, // Indian Standard Time (IST)
    hour12: false, // Use 24-hour format
  };

  const currentDate = new Date().toLocaleString("en-US", istOptions);
  const currentHour = parseInt(currentDate.split(",")[1].split(":")[0]);

  return currentHour >= wakeupHour && currentHour < sleepHour;
}

const OnlineBadge = () => (
  <StatusBadge color={"green"} compact={useBreakpointValue([true, false])}>
    Online
  </StatusBadge>
);

const OfflineBadge = () => (
  <StatusBadge color={"gray"} compact={useBreakpointValue([true, false])}>
    Offline
  </StatusBadge>
);

export default function TimeBasedOnlineStatusBadge() {
  return isOnline() ? <OnlineBadge /> : <OfflineBadge />;
}
