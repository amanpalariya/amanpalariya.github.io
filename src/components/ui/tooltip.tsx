import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends ChakraTooltip.RootProps {
  children?: React.ReactNode
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  content: React.ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      ...rest
    } = props

    if (disabled) return children

    const mergedContentProps: ChakraTooltip.ContentProps = {
      fontFamily: "ui",
      ...contentProps,
    }
    const Trigger = ChakraTooltip.Trigger as React.ComponentType<{
      asChild?: boolean
      children?: React.ReactNode
    }>
    const Positioner = ChakraTooltip.Positioner as React.ComponentType<{
      children?: React.ReactNode
    }>
    const Content = ChakraTooltip.Content as React.ForwardRefExoticComponent<
      ChakraTooltip.ContentProps &
        { children?: React.ReactNode } &
        React.RefAttributes<HTMLDivElement>
    >
    const Arrow = ChakraTooltip.Arrow as React.ComponentType<{
      children?: React.ReactNode
    }>

    return (
      <ChakraTooltip.Root {...rest}>
        <Trigger asChild>{children}</Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <Positioner>
            <Content ref={ref} {...mergedContentProps}>
              {showArrow && (
                <Arrow>
                  <ChakraTooltip.ArrowTip />
                </Arrow>
              )}
              {content}
            </Content>
          </Positioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  },
)
