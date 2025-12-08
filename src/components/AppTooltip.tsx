import { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "../utils/common-utils";

interface CustomTooltipProps {
  trigger: ReactNode;
  tooltip?: ReactNode;
  className?: string;
  side?: "left" | "right" | "bottom" | "top";
  align?: "start" | "end" | "center";
  sideOffset?: number;
}
const AppTooltip = ({
  trigger,
  tooltip,
  className,
  side = "top",
  align = "start",
  sideOffset,
}: CustomTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        {createPortal(
          <TooltipContent
            className={cn("shadcn-tooltip", className)}
            side={side}
            align={align}
            sideOffset={sideOffset}
          >
            {tooltip}
          </TooltipContent>,
          document.body // Render in the body to avoid overlap issues
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default AppTooltip;
