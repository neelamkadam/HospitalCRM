import { ChevronRight } from "lucide-react";
import React, { useContext } from "react";
import { VisibilityContext } from "react-horizontal-scrolling-menu";

const RightArrowScroll: React.FC = () => {
  const visibility = useContext(VisibilityContext);

  const handleClick = (e: any) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling

    try {
      if (visibility?.scrollNext) {
        visibility.scrollNext();
      }
    } catch (error) {
      console.error("Error scrolling right:", error);
    }
  };

  return (
    <button
      type="button" // Explicitly set button type
      onClick={handleClick}
      className="p-0 rounded-full"
      aria-label="Scroll right"
    >
      <ChevronRight className="h-10 w-10 text-slate-500 bg-slate-100 hover:bg-[#CBE1E5] rounded-full p-2" />
    </button>
  );
};

export default RightArrowScroll;
