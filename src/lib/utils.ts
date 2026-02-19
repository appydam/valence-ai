import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SSH_PROXY_URL = import.meta.env.VITE_SSH_PROXY_URL || "http://localhost:3001";
