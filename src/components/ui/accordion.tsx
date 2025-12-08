import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/common-utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={className}
    // className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  text?: string; // New prop to control the conditional text
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, text = "", ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "bg-[#F7F8F8] data-[state=closed]:border-[#EBECEE] data-[state=closed]:rounded-md data-[state=open]:border-none border rounded-none flex flex-1 items-center py-4 text-sm font-normal transition-all text-left justify-between [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      <div className="flex gap-4 pl-3 font-normal w-full">
        {/* <BriefcaseMedical size={26} className="text-[#8C929A]" /> */}
        {children}
        {/* <span className="bg-[#EBECEE] text-[#8C929A] text-sm font-medium me-2 px-2.5 py-1 rounded-sm">
          {text}
        </span> */}
      </div>
      <ChevronDown className="h-4 w-7 ml-1 me-1 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all duration-1000 p-[10px] ease-in-out data-[state=closed]:h-0 data-[state=open]:h-auto",
      className
    )}
    {...props}
  >
    <div className="md:px-3 md:pb-3">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
