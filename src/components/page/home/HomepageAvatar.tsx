import { Box, Image } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";
import { Avatar } from "@components/ui/avatar";

export default function HomepageAvatar({
  src,
  name,
}: {
  src?: string;
  name?: string;
}) {
  return (
    <Box
      rounded={"full"}
      p={2}
      borderWidth={"thick"}
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Avatar src={src} name={name} boxSize={"48"} />
    </Box>
  );
}
