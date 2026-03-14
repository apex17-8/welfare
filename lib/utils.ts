import { clsx, type ClassValue } from 'clsx'

// Simple fallback for tailwind-merge - just use clsx for now
// The full tailwind-merge library handles complex class merging
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
