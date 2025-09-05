import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn = className utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
