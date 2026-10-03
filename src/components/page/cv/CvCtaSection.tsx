import { HStack, VStack } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";
import ContentSection from "@components/page/common/ContentSection";
import { PrimaryActionButton } from "@components/core/Buttons";
import { Heading4, ParagraphText } from "./CvTypography";
import { homepageTabs } from "app/route-info";
import NextLink from "next/link";

export default function CvCtaSection({
  title = "Curriculum Vitae",
  description = "Dive into my detailed CV with experience highlights, skills, and selected projects.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <ContentSection>
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <VStack align="start" gap={2}>
          <Heading4>{title}</Heading4>
          <ParagraphText>{description}</ParagraphText>
        </VStack>
        <PrimaryActionButton icon={FiArrowRight} asChild>
          <NextLink href={homepageTabs.cv.pathname}>View CV</NextLink>
        </PrimaryActionButton>
      </HStack>
    </ContentSection>
  );
}
