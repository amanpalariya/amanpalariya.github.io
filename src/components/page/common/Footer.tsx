import { VStack, Text, Icon, Link } from "@chakra-ui/react";
import { InnerBgCard } from "../../core/Cards";
import { PersonalData } from "data";
import { FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <InnerBgCard>
      <VStack p={4} color={"app.fg.subtle"}>
        <Text fontSize={"sm"} textAlign={"center"}>
          Share your feedback/suggestions about this website on{" "}
          <Link href={PersonalData.linkedIn.url} target="_blank">
              LinkedIn <Icon boxSize={2.5} ><FiArrowUpRight/></Icon>
          </Link>
        </Text>
      </VStack>
    </InnerBgCard>
  );
}
