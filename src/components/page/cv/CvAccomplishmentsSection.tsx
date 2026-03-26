import {
  Box,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
  Wrap,
  WrapItem,
  SimpleGrid,
  Image,
  Button,
} from "@chakra-ui/react";
import { CategoryBadge } from "@components/core/Badges";
import { ParagraphText, Heading4 } from "@components/core/Texts";
import type { CvSectionBase } from "data/cv";
import { useState, type ElementType } from "react";
import { FiLink, FiEye } from "react-icons/fi";
import CvSection from "./CvSection";
import { AppAccentPalette, AppPalette } from "theme/colors";
import {
  CV_CMU_FONT_FAMILY,
  CV_META_TEXT_SIZE,
  CV_SECONDARY_TEXT_COLOR,
} from "./cvStyleTokens";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@components/ui/dialog";

export interface CvAccomplishmentVisualItem {
  title: string;
  issuer?: string;
  date?: string;
  meta?: string;
  summary?: string;
  tags?: string[];
  url?: string;
  imageSrc?: string;
}

function AccomplishmentCard({
  item,
  accentColorPalette,
  onViewImage,
}: {
  item: CvAccomplishmentVisualItem;
  accentColorPalette?: AppAccentPalette;
  onViewImage?: (src: string, title: string) => void;
}) {
  const metaText =
    item.meta || [item.issuer, item.date].filter(Boolean).join(" · ");

  return (
    <Box
      borderWidth={1}
      borderColor={"app.border.default"}
      borderRadius="2xl"
      p={4}
      bg={"app.bg.card"}
      height="full"
      transition="transform 0.2s ease, border-color 0.2s ease"
      _hover={{ borderColor: "app.border.strong" }}
    >
      <VStack align="stretch" gap={2} height="full">
        <VStack align="stretch" gap={0.5}>
          <HStack justify="space-between" align="start" gap={2}>
            <Heading4>{item.title}</Heading4>
            <HStack gap={2}>
              {item.imageSrc && onViewImage && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onViewImage(item.imageSrc!, item.title)}
                  title="View Certificate"
                >
                  <Icon as={FiEye} />
                </Button>
              )}
              {item.url && (
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${item.title} credential (opens in a new tab)`}
                  fontSize={CV_META_TEXT_SIZE}
                  color={CV_SECONDARY_TEXT_COLOR}
                  fontFamily={CV_CMU_FONT_FAMILY}
                  _hover={{ color: "app.fg.default" }}
                >
                  <Icon as={FiLink} />
                </Link>
              )}
            </HStack>
          </HStack>
          {metaText ? (
            <Text
              fontSize={CV_META_TEXT_SIZE}
              color={CV_SECONDARY_TEXT_COLOR}
              fontFamily={CV_CMU_FONT_FAMILY}
            >
              {metaText}
            </Text>
          ) : null}
        </VStack>

        {item.summary ? (
          <ParagraphText size="sm" justifyText>
            {item.summary}
          </ParagraphText>
        ) : null}

        <Box mt="auto">
          {item.tags && item.tags.length > 0 ? (
            <Wrap gap={2}>
              {item.tags.map((tag) => (
                <WrapItem key={`${item.title}-${tag}`}>
                  <CategoryBadge color={accentColorPalette ?? "gray"}>
                    {tag}
                  </CategoryBadge>
                </WrapItem>
              ))}
            </Wrap>
          ) : null}
        </Box>
      </VStack>
    </Box>
  );
}

export default function CvAccomplishmentsSection({
  section,
  items,
  titleIcon,
  primaryColorPalette,
  accentColorPalette,
}: {
  section: CvSectionBase;
  items: CvAccomplishmentVisualItem[];
  titleIcon?: ElementType;
  primaryColorPalette?: AppPalette;
  accentColorPalette?: AppAccentPalette;
}) {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  if (!section || items.length === 0) return null;

  return (
    <CvSection
      id={section.id}
      title={section.title}
      description={section.description}
      titleIcon={titleIcon}
      primaryColorPalette={primaryColorPalette}
      accentColorPalette={accentColorPalette}
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={[2, 3]}>
        {items.map((item, index) => (
          <AccomplishmentCard
            key={`${item.title}-${index}`}
            item={item}
            accentColorPalette={accentColorPalette}
            onViewImage={(src, title) => setSelectedImage({ src, title })}
          />
        ))}
      </SimpleGrid>

      <DialogRoot
        open={!!selectedImage}
        onOpenChange={(e) => !e.open && setSelectedImage(null)}
        size="lg"
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {selectedImage && (
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                borderRadius="md"
                w="full"
              />
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </CvSection>
  );
}
