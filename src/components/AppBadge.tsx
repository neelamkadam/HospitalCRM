import React from "react";
import { Badge, BadgeProps } from "./ui/badge";
import { cn } from "../lib/utils";

interface AppBadgeProps extends BadgeProps {
  variant?: BadgeProps["variant"];
  className?: string;
  children: React.ReactNode;
}

const AppBadge: React.FC<AppBadgeProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  return (
    <Badge variant={variant} className={cn(className)} {...props}>
      {children}
    </Badge>
  );
};

export default AppBadge;
