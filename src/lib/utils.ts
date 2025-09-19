import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Wraps Supabase query results and converts UTC date fields to ISO strings
 * adjusted to the server's local timezone.
 *
 * @param query - The Supabase query (e.g., supabase.from(...).select(...))
 * @param dateFields - The list of columns that are UTC dates to convert
 */
export async function fetchWithTimezone(
  query: any,
  dateFields: string[] = ['created_at', 'updated_at', 'start_date', 'end_date', 'claimed_at']
) {
  // This function is simplified to no longer perform timezone conversion on the server.
  // The raw date strings from the database (which are in UTC) will be passed to the client.
  // The client is responsible for formatting these dates into the user's local timezone.
  const { data, error, count } = await query;

  return { data, error, count };
}
