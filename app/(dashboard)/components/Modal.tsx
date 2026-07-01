"use client";

import React, { cloneElement, isValidElement, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type ChildProps = {
  closeModal?: () => void;
};

const Modal = ({
  title,
  trigger,
  children,
  tooltipText,
  onOpenChange,
  open,
}: {
  title: React.ReactNode;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  tooltipText?: string;
  onOpenChange?: (open: boolean | undefined) => void;
  open?: boolean;
}) => {
  const childWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<ChildProps>, {
        closeModal: () => onOpenChange?.(false),
      })
    : children;

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && tooltipText && tooltipText !== "" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {trigger && (!tooltipText || tooltipText === "") && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">{childWithProps}</div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
