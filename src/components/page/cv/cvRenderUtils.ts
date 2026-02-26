import type {
  CvAwardItem,
  CvCollectionSection,
  CvData,
  CvEducationItem,
  CvSectionBase,
  CvTimelineItem,
  CvVolunteeringItem,
} from "data/cv";

export type CvSectionKey = keyof CvData["sections"];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatShortMonth(month: number) {
  return SHORT_MONTHS[month - 1];
}

export function formatCvDate(date?: string) {
  const value = date?.trim();
  if (!value) return "";

  const yearMatch = value.match(/^(\d{4})$/);
  if (yearMatch) {
    return yearMatch[1];
  }

  const yearMonthMatch = value.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    return `${formatShortMonth(Number(month))} ${year}`;
  }

  const fullDateMatch = value.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch;
    return `${formatShortMonth(Number(month))} ${Number(day)}, ${year}`;
  }

  return value;
}

export function formatCvDateRange({
  start,
  end,
  presentWhenEndMissing = false,
}: {
  start?: string;
  end?: string;
  presentWhenEndMissing?: boolean;
}) {
  const startDisplay = formatCvDate(start);
  const endValue = end?.trim();

  if (!endValue) {
    if (!startDisplay) return "";
    return presentWhenEndMissing ? `${startDisplay} – Present` : startDisplay;
  }

  const endDisplay = /^present$/i.test(endValue) ? "Present" : formatCvDate(endValue);

  if (!startDisplay) return endDisplay;
  if (!endDisplay || startDisplay === endDisplay) return startDisplay;

  return `${startDisplay} – ${endDisplay}`;
}

export function isCollectionSectionEmpty<T>(items?: T[]) {
  return !items || items.length === 0;
}

export function getSectionPriority(section: CvSectionBase | undefined, fallback: number) {
  if (!section) return fallback;
  return section.visibility?.priority ?? fallback;
}

export function isSectionEnabled(
  section:
    | (CvSectionBase & { content: string })
    | (CvSectionBase & { roles: string[] })
    | CvCollectionSection<unknown>
    | undefined,
) {
  if (!section) return false;
  if (section.visibility?.enabled === false) return false;

  if ("content" in section) {
    return Boolean(section.content?.trim());
  }

  if ("roles" in section) {
    return section.roles.length > 0;
  }

  if ("items" in section) {
    return !isCollectionSectionEmpty(section.items);
  }

  return true;
}

export function getRenderableCvSections(sections: CvData["sections"]) {
  return (Object.entries(sections) as Array<[CvSectionKey, CvData["sections"][CvSectionKey]]>)
    .map(([key, section], index) => ({
      nodeKey: key,
      section,
      priority: getSectionPriority(section as CvSectionBase | undefined, index + 100),
    }))
    .filter(({ section }) => isSectionEnabled(section as never))
    .sort((a, b) => a.priority - b.priority)
    .map(({ nodeKey, section }) => ({
      nodeKey,
      id: section!.id,
      title: section!.title,
    }));
}

export function mapEducationToTimelineItems(items: CvEducationItem[]): CvTimelineItem[] {
  return items.map((item) => ({
    title: item.degree,
    organization: item.institution,
    location: item.location,
    start: item.start,
    end: item.end,
    summary: item.summary,
    highlights: item.highlights,
  }));
}

export function mapVolunteeringToTimelineItems(
  items: CvVolunteeringItem[],
): CvTimelineItem[] {
  return items.map((item) => ({
    title: item.role,
    organization: item.organization,
    start: item.start,
    end: item.end,
    summary: item.summary,
    highlights: item.highlights,
  }));
}

export function mapAwardsToTimelineItems(items: CvAwardItem[]): CvTimelineItem[] {
  return items.map((item) => ({
    title: item.title,
    organization: item.issuer ?? "Award",
    start: item.date ?? "",
    summary: item.summary,
  }));
}
