import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export const TooltipDialogBtn = ({
  tooltip,
  children,
}: {
  tooltip: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);
