"use client";

import {
  Heading1,
  Heading2,
  Heading3,
  LinkText,
  ParagraphText,
} from "@components/core/Texts";

import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { ImageBlock } from "@components/core/Images";
import { FiArrowUpRight } from "react-icons/fi";
import { CodeBlock } from "@components/core/Blocks";
import { useState } from "react";
import { PrimaryActionButton } from "@components/core/Buttons";

function ArticleHeading1({ children }: { children: any }) {
  return <Heading1>{children}</Heading1>;
}

function ArticleHeading2({ children }: { children: any }) {
  return <Heading2>{children}</Heading2>;
}

function ArticleHeading3({ children }: { children: any }) {
  return <Heading3>{children}</Heading3>;
}

function ArticleParagraph({ children }: { children: any }) {
  return <ParagraphText justifyText>{children}</ParagraphText>;
}

function ArticleBold({ children }: { children: any }) {
  return (
    <Text as={"span"} fontWeight={"extrabold"}>
      {children}
    </Text>
  );
}

function ArticleItalic({ children }: { children: any }) {
  return (
    <Text as={"span"} fontStyle={"italic"}>
      {children}
    </Text>
  );
}

function ArticleImage({
  src,
  caption,
  alt,
}: {
  src: string;
  caption?: string;
  alt?: string;
}) {
  return <ImageBlock src={src} caption={caption} alt={alt} />;
}

function ArticleLink({
  url,
  isExternal,
  children,
}: {
  url: string;
  isExternal?: boolean;
  children?: string;
}) {
  return (
    <LinkText href={url} isExternal={isExternal}>
      {children ?? url}
      {isExternal ? (
        <Icon boxSize={2.5}>
          <FiArrowUpRight />
        </Icon>
      ) : null}
    </LinkText>
  );
}

function ArticleCodeBlock({ children }: { children: any }) {
  return <CodeBlock>{children}</CodeBlock>;
}

function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return (
    <VStack align={"start"} gap={3}>
      <HStack>
        <Text as="b">Interactive Counter:</Text>
        <Text>{count}</Text>
      </HStack>
      <PrimaryActionButton onClick={() => setCount((c) => c + 1)}>
        Increment
      </PrimaryActionButton>
    </VStack>
  );
}

export const h1 = ArticleHeading1;
export const h2 = ArticleHeading2;
export const h3 = ArticleHeading3;
export const img = ArticleImage;
export const link = ArticleLink;
export const para = ArticleParagraph;
export const b = ArticleBold;
export const i = ArticleItalic;
export const code = ArticleCodeBlock;
export const interactive = InteractiveCounter;
