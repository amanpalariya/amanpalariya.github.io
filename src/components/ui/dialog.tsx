import {
  Dialog as ChakraDialog,
  Portal,
  type BoxProps,
  type ButtonProps,
} from "@chakra-ui/react"
import { CloseButton } from "./close-button"
import * as React from "react"

type ForwardedDivComponent<TProps> = React.ForwardRefExoticComponent<
  TProps & React.RefAttributes<HTMLDivElement>
>

interface DialogContentProps extends BoxProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  backdrop?: boolean
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent(props, ref) {
  const {
    children,
    portalled = true,
    portalRef,
    backdrop = true,
    ...rest
  } = props
  const Positioner = ChakraDialog.Positioner as React.ComponentType<{
    children?: React.ReactNode
  }>
  const Content = ChakraDialog.Content as ForwardedDivComponent<
    BoxProps & { asChild?: boolean; children?: React.ReactNode }
  >

  return (
    <Portal disabled={!portalled} container={portalRef}>
      {backdrop && <ChakraDialog.Backdrop />}
      <Positioner>
        <Content ref={ref} {...rest} asChild={false}>
          {children}
        </Content>
      </Positioner>
    </Portal>
  )
})

export const DialogCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function DialogCloseTrigger(props, ref) {
  const CloseTrigger = ChakraDialog.CloseTrigger as React.ComponentType<
    ButtonProps & { asChild?: boolean; children?: React.ReactNode }
  >

  return (
    <CloseTrigger
      position="absolute"
      top="2"
      insetEnd="2"
      {...props}
      asChild
    >
      <CloseButton size="sm" ref={ref}>
        {props.children}
      </CloseButton>
    </CloseTrigger>
  )
})

export const DialogRoot = ChakraDialog.Root
export const DialogFooter = ChakraDialog.Footer
export const DialogHeader = ChakraDialog.Header
export const DialogBody = ChakraDialog.Body
export const DialogBackdrop = ChakraDialog.Backdrop
export const DialogTitle = ChakraDialog.Title as React.ComponentType<
  BoxProps & { children?: React.ReactNode }
>
export const DialogDescription = ChakraDialog.Description
export const DialogTrigger = ChakraDialog.Trigger as React.ComponentType<
  ButtonProps & { asChild?: boolean; children?: React.ReactNode }
>
export const DialogActionTrigger = ChakraDialog.ActionTrigger
