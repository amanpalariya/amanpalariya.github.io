import { Box } from "@chakra-ui/react";
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
      borderColor={"app.border.default"}
    >
      <Avatar src={src} name={name} boxSize={"48"} />
    </Box>
  );
}
