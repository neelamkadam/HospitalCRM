import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../redux/store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Set the default theme to light mode if the theme state is not set yet
    if (theme === undefined || theme === "light") {
      document.documentElement.classList.remove("dark"); // Ensure light mode
    } else {
      document.documentElement.classList.add("dark"); // Set dark mode
    }
  }, [theme]);

  return <div>{children}</div>;
}
