import {
  HStack,
  VStack,
  Link,
  Icon,
  Wrap,
  WrapItem,
  Text,
} from "@chakra-ui/react";
import { Heading2, ParagraphText, SubtitleText } from "@components/core/Texts";
import { CategoryBadge } from "@components/core/Badges";
import type { CvProfile } from "data/cv";
import { FiMail, FiMapPin, FiLink } from "react-icons/fi";
import { useColorModeValue } from "@components/ui/color-mode";

export default function CvHero({ profile }: { profile: CvProfile }) {
  const secondaryColor = useColorModeValue("gray.600", "gray.300");

  return (
    <VStack align={"stretch"} gap={4}>
      <VStack align={"stretch"} gap={2}>
        <Heading2>{profile.name}</Heading2>
        <SubtitleText>{profile.headline}</SubtitleText>
      </VStack>
      <ParagraphText>{profile.summary}</ParagraphText>
      <Wrap spacing={3} align="center">
        {profile.location ? (
          <WrapItem>
            <HStack gap={2} color={secondaryColor}>
              <Icon as={FiMapPin} />
              <Text fontSize="sm">{profile.location}</Text>
            </HStack>
          </WrapItem>
        ) : null}
        {profile.email ? (
          <WrapItem>
            <HStack gap={2} color={secondaryColor}>
              <Icon as={FiMail} />
              <Link fontSize="sm" href={`mailto:${profile.email}`}>
                {profile.email}
              </Link>
            </HStack>
          </WrapItem>
        ) : null}
        {profile.website ? (
          <WrapItem>
            <HStack gap={2} color={secondaryColor}>
              <Icon as={FiLink} />
              <Link fontSize="sm" href={profile.website} isExternal>
                {profile.website.replace("https://", "")}
              </Link>
            </HStack>
          </WrapItem>
        ) : null}
      </Wrap>
      {profile.links && profile.links.length > 0 ? (
        <Wrap spacing={2}>
          {profile.links.map((link) => (
            <WrapItem key={link.url}>
              <Link href={link.url} isExternal>
                <CategoryBadge color="blue">{link.label}</CategoryBadge>
              </Link>
            </WrapItem>
          ))}
        </Wrap>
      ) : null}
    </VStack>
  );
}