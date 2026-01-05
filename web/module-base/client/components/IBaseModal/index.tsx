"use client";

import {
  Modal as HeroUIModal,
  ModalBody as HeroUIModalBody,
  ModalContent as HeroUIModalContent,
  ModalFooter as HeroUIModalFooter,
  ModalHeader as HeroUIModalHeader,
  type ModalBodyProps as HeroUIModalBodyProps,
  type ModalContentProps as HeroUIModalContentProps,
  type ModalFooterProps as HeroUIModalFooterProps,
  type ModalHeaderProps as HeroUIModalHeaderProps,
  type ModalProps as HeroUIModalProps,
} from "@heroui/modal";
import React from "react";

// Export types
export type IBaseModalProps = HeroUIModalProps;
export type IBaseModalBodyProps = HeroUIModalBodyProps;
export type IBaseModalContentProps = HeroUIModalContentProps;
export type IBaseModalFooterProps = HeroUIModalFooterProps;
export type IBaseModalHeaderProps = HeroUIModalHeaderProps;

// Main Modal component with default props
export const IBaseModal = React.forwardRef<HTMLDivElement, IBaseModalProps>(
  (props, ref) => {
    const {
      placement = "center",
      scrollBehavior = "inside",
      backdrop = "blur",
      ...rest
    } = props;

    return (
      <HeroUIModal
        ref={ref}
        backdrop={backdrop}
        placement={placement}
        scrollBehavior={scrollBehavior}
        {...rest}
      />
    );
  }
);

IBaseModal.displayName = "IBaseModal";

// ModalContent component
export const IBaseModalContent: React.FC<IBaseModalContentProps> = (props) => {
  return <HeroUIModalContent {...props} />;
};

IBaseModalContent.displayName = "IBaseModalContent";

// ModalHeader component
export const IBaseModalHeader: React.FC<IBaseModalHeaderProps> = (props) => {
  return <HeroUIModalHeader {...props} />;
};

IBaseModalHeader.displayName = "IBaseModalHeader";

// ModalBody component
export const IBaseModalBody: React.FC<IBaseModalBodyProps> = (props) => {
  return <HeroUIModalBody {...props} />;
};

IBaseModalBody.displayName = "IBaseModalBody";

// ModalFooter component
export const IBaseModalFooter: React.FC<IBaseModalFooterProps> = (props) => {
  return <HeroUIModalFooter {...props} />;
};

IBaseModalFooter.displayName = "IBaseModalFooter";

// Default export
export default IBaseModal;
