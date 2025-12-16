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
const IBaseModal = React.forwardRef<HTMLDivElement, IBaseModalProps>(
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
  },
);

IBaseModal.displayName = "IBaseModal";

// ModalContent component
const IBaseModalContent: React.FC<IBaseModalContentProps> = (props) => {
  return <HeroUIModalContent {...props} />;
};

IBaseModalContent.displayName = "IBaseModalContent";

// ModalHeader component
const IBaseModalHeader: React.FC<IBaseModalHeaderProps> = (props) => {
  return <HeroUIModalHeader {...props} />;
};

IBaseModalHeader.displayName = "IBaseModalHeader";

// ModalBody component
const IBaseModalBody: React.FC<IBaseModalBodyProps> = (props) => {
  return <HeroUIModalBody {...props} />;
};

IBaseModalBody.displayName = "IBaseModalBody";

// ModalFooter component
const IBaseModalFooter: React.FC<IBaseModalFooterProps> = (props) => {
  return <HeroUIModalFooter {...props} />;
};

IBaseModalFooter.displayName = "IBaseModalFooter";

// Export all components
export {
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
};

// Also export with shorter names for convenience
export {
  IBaseModal as Modal,
  IBaseModalBody as ModalBody,
  IBaseModalContent as ModalContent,
  IBaseModalFooter as ModalFooter,
  IBaseModalHeader as ModalHeader,
};

// Default export
export default IBaseModal;
