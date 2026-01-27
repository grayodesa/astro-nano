import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}

/**
 * Extract an excerpt from HTML content
 * @param html HTML content to extract excerpt from
 * @param maxLength Maximum length of excerpt (default: 160 characters)
 * @returns Extracted excerpt as plain text
 */
export function getExcerpt(html: string | undefined | null, maxLength: number = 160): string {
  if (!html) return '';

  // Remove HTML tags
  const textOnly = html.replace(/<[^>]+>/g, "");
  
  // Remove extra whitespace
  const cleanText = textOnly.replace(/\s+/g, " ").trim();
  
  // If text is shorter than maxLength, return it as is
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Otherwise, truncate at the last space before maxLength
  const truncated = cleanText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  
  // If no space found, just return the truncated text
  if (lastSpaceIndex === -1) {
    return truncated + "...";
  }
  
  // Return text truncated at the last space
  return truncated.substring(0, lastSpaceIndex) + "...";
}