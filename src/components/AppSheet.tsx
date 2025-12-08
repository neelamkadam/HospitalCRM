import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";

interface CustomSheetProps {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  toggle: () => void;
  className?: string;
  onOpenAutoFocus?: (e: Event) => void;
  disableOutsideClose?: boolean;
}

const CustomSheet: React.FC<CustomSheetProps> = ({
  isOpen,
  title,
  content,
  toggle,
  className = "",
  onOpenAutoFocus,
  disableOutsideClose = false,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={toggle}>
      <SheetContent
        className={`bg-white overflow-auto min-w-[100%] md:min-w-[50%] lg:min-w-[35.3%] ${className} z-[1000]`}
        onOpenAutoFocus={onOpenAutoFocus || ((e) => e.preventDefault())}
        onInteractOutside={(e) => {
          // Prevent closing when clicking chatbot
          const target = e.target as HTMLElement;
          if (target.closest("#chatbot-container")) {
            e.preventDefault();
          }

          if (disableOutsideClose) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};

export default CustomSheet;
