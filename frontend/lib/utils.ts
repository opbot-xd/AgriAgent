import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  // Remove trailing slash from base and leading slash from path
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
