"use client";

import React, { cloneElement, isValidElement, useState } from "react";
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
import { Button } from "@/components/ui/button";

type ChildProps = {
  closeModal?: () => void;
};

const Modal = ({
  title,
  trigger,
  children,
  tooltipText,
}: {
  title: React.ReactNode;
  trigger: React.ReactNode;
  children: React.ReactNode;
  tooltipText?: string;
}) => {
  const [open, setOpen] = useState(false);

  const childWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<ChildProps>, {
        closeModal: () => setOpen(false),
      })
    : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltipText && tooltipText !== "" ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl max-h-[80%] flex flex-col lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {childWithProps}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
