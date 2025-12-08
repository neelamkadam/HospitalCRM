import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ParsedItem } from "../types/app.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ Updated: UserInitialName now works with "Dr." prefix automatically
export const UserInitialName = (
  first: string | undefined,
  second?: string | undefined
) => {
  if (!first) return "";

  // If there's a dot in the name, take everything after the last dot
  const cleanedFirst = first.includes(".")
    ? first.split(".").pop()?.trim() || ""
    : first.trim();
  const cleanedSecond =
    second && second.includes(".")
      ? second.split(".").pop()?.trim() || ""
      : second;

  if (!cleanedFirst) return "";
  if (!cleanedSecond) return cleanedFirst[0].toUpperCase();

  return cleanedFirst[0].toUpperCase() + cleanedSecond[0].toUpperCase();
};

export const ConditionsStatusOrder = ["Acute", "Chronic", "Temporary", "Test"];
export const ProfielShareMessage = (link = "", Id = "") =>
  `Patient Access Link: ${link}\n\n One-Time Login & Password: ${Id}`;

export const customRound = (value: number | string) => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const decimal = numericValue - Math.floor(numericValue);
  if (decimal <= 0.05) {
    return Math.floor(numericValue);
  } else {
    return Math.ceil(numericValue);
  }
};

export function parseStructure(str: string): ParsedItem[] {
  const lines = str
    ?.split("\n")
    ?.map((l) => l.trim())
    ?.filter((l) => l !== "");

  const result: ParsedItem[] = [];
  let current: ParsedItem | null = null;

  lines?.forEach((line) => {
    if (!line?.startsWith("-")) {
      // New header
      if (current) result.push(current);
      current = { header: line, subheaders: [] };
    } else {
      // Subheading
      if (current) {
        current.subheaders?.push(line.substring(1).trim());
      }
    }
  });

  // Push the last one
  if (current) result?.push(current);

  // Remove empty subheaders
  result?.forEach((item) => {
    if (item.subheaders && item.subheaders.length === 0) {
      delete item.subheaders;
    }
  });

  return result;
}

export const UserThreeInitials = (name: string | undefined): string => {
  if (!name) return "";
  return name.substring(0, 3).toUpperCase();
};

export const formatRevenue = (num: number): string => {
  if (num >= 10000000)
    return (num / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr"; // Crores
  if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, "") + "L"; // Lakhs
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // Thousands
  return num.toString();
};
