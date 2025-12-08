import { ChevronLeft } from "lucide-react";
import React, { useContext } from "react";
import { VisibilityContext } from "react-horizontal-scrolling-menu";

const LeftArrowScroll: React.FC = () => {
  const visibility = useContext(VisibilityContext);

  const handleClick = (e: any) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling

    try {
      if (visibility?.scrollPrev) {
        visibility.scrollPrev();
      }
    } catch (error) {
      console.error("Error scrolling left:", error);
    }
  };

  return (
    <button
      type="button" // Explicitly set button type
      onClick={handleClick}
      className="p-0 rounded-full"
      aria-label="Scroll left"
    >
      <ChevronLeft className="h-10 w-10 text-slate-500 bg-slate-100 hover:bg-[#CBE1E5] rounded-full p-2" />
    </button>
  );
};

export default LeftArrowScroll;
