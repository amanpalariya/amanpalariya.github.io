"use client";

import { Center, Image, Text, VStack } from "@chakra-ui/react";

export function ImageBlock({
  src,
  caption,
  alt,
}: {
  src: string;
  caption?: string;
  alt?: string;
}) {
  return (
    <Center>
      <VStack
        p={[2, 4]}
        maxW={"5xl"}
        borderWidth={"thin"}
        rounded={"3xl"}
        borderColor={"app.border.muted"}
        background={"app.bg.canvas"}
      >
        <Image src={src} rounded={"xl"} alt={""} />
        {caption ? <Text>{caption}</Text> : null}
      </VStack>
    </Center>
  );
}
