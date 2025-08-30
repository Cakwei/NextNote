import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertTime(date: string) {
  try {
    const UTCDate = new Date(date);

    if (isNaN(UTCDate.getTime())) {
      return;
    }

    const newTime = UTCDate.toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return newTime.replace(" at ", " ").trim();
  } catch (error) {
    console.error("Conversion Error:", error);
  }
}
