import { cn } from "../utils/common-utils";
import { Button } from "./ui/button";
import { useAppSelector } from "../redux/store.ts";

interface ButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  disable?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
  children?: React.ReactNode;
  loadingText?: string;
  loaddingClass?: string;
}

const AppButton = ({
  label,
  className,
  onClick,
  type = "button",
  disable = false,
  variant = "primary",
  isLoading = false,
  children,
}: // loadingText,
// loaddingClass,
ButtonProps) => {
  const secondaryVariantCalss = "bg-transparent text-white";
  const destructiveVariantClass = "bg-red-600 text-white hover:bg-red-700";
  const { theme } = useAppSelector((state) => state.theme);

  return (
    <Button
      type={type}
      className={cn(
        "bg-primary border-white border-[1px] border-opacity-25 rounded-[900px] w-[150px] h-[47px] mt-10",
        className,
        `${
          theme !== "dark"
            ? "border-gray-700 bg-[#01576A] text-gray-200 placeholder-gray-500"
            : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
        }`,
        variant === "secondary" ? secondaryVariantCalss : "",
        variant === "destructive" ? destructiveVariantClass : "",
        disable || isLoading
          ? "cursor-not-allowed opacity-45 text-[#16191D]"
          : ""
      )}
      onClick={disable || isLoading ? undefined : onClick}
      disabled={disable || isLoading}
    >
      {isLoading ? (
        <>
          {/* <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#16191D]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25 text-white"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75 text-[#16191D]"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText ? loadingText : "Loading..."} */}
        </>
      ) : (
        <>{children ?? label ?? "Submit"}</>
      )}
    </Button>
  );
};

export default AppButton;
