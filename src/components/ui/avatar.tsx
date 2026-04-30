import {
  Avatar as ChakraAvatar,
  AvatarGroup as ChakraAvatarGroup,
} from "@chakra-ui/react"
import * as React from "react"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

export interface AvatarProps extends ChakraAvatar.RootProps {
  name?: string
  src?: string
  srcSet?: string
  loading?: ImageProps["loading"]
  icon?: React.ReactElement
  fallback?: React.ReactNode
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const { name, src, srcSet, loading, icon, fallback, children, ...rest } =
      props
    const Fallback = ChakraAvatar.Fallback as React.ComponentType<{
      children?: React.ReactNode
      name?: string
    }>
    const Image = ChakraAvatar.Image as React.ComponentType<ImageProps>

    return (
      <ChakraAvatar.Root ref={ref} {...rest}>
        <Fallback name={name}>{icon || fallback}</Fallback>
        <Image
          src={src}
          srcSet={srcSet}
          loading={loading}
          alt={name ?? ""}
        />
        {children}
      </ChakraAvatar.Root>
    )
  },
)

export const AvatarGroup = ChakraAvatarGroup
