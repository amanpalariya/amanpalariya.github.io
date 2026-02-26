import { HStack, Icon, Link, Text, VStack } from "@chakra-ui/react";
import type { CvContactChannel, CvSectionBase } from "data/cv";
import type { ElementType } from "react";
import {
  FiMail,
  FiLinkedin,
  FiGithub,
  FiGlobe,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import type { AppAccentPalette, AppPalette } from "theme/colors/types";
import CvSection from "./CvSection";

function iconFromKey(iconKey?: CvContactChannel["iconKey"]) {
  switch (iconKey) {
    case "email":
      return FiMail;
    case "linkedin":
      return FiLinkedin;
    case "github":
      return FiGithub;
    case "website":
      return FiGlobe;
    case "phone":
      return FiPhone;
    case "location":
      return FiMapPin;
    default:
      return FiGlobe;
  }
}

function ContactItem({ item }: { item: CvContactChannel }) {
  const iconColor = "app.fg.subtle";
  const textColor = "app.fg.muted";

  return (
    <HStack
      align="center"
      justify="space-between"
      p={3}
      borderRadius="lg"
      borderWidth={1}
      borderColor={"app.border.muted"}
      bg={"app.bg.overlay"}
      flexWrap="wrap"
      gap={2}
    >
      <HStack gap={3}>
        <Icon as={iconFromKey(item.iconKey)} color={iconColor} />
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {item.label}
        </Text>
      </HStack>
      {item.url ? (
        <Link href={item.url} isExternal fontSize="sm">
          {item.value}
        </Link>
      ) : (
        <Text fontSize="sm" color={textColor}>
          {item.value}
        </Text>
      )}
    </HStack>
  );
}

export default function CvContactSection({
  section,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase & { items: CvContactChannel[] };
  titleIcon?: ElementType;
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
}) {
  if (!section || section.items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <VStack align="stretch" gap={3}>
        {section.items.map((item) => (
          <ContactItem key={`${item.label}-${item.value}`} item={item} />
        ))}
      </VStack>
    </CvSection>
  );
}
