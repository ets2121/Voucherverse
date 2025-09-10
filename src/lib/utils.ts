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
  const { data, error, count } = await query;

  if (error || !data) {
    return { data, error, count };
  }

  // This logic now runs on the server, so it uses the server's timezone.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const convertedData = data.map((row: any) => {
    const newRow = { ...row };
    dateFields.forEach(field => {
      if (newRow[field] && typeof newRow[field] === 'string') {
        try {
          // Create a date object assuming the input is UTC
          const utcDate = new Date(newRow[field]);
          
          // Format it to a string representing the local time in the server's timezone.
          // This does NOT change the underlying value, just its string representation.
          const localDateString = utcDate.toLocaleString('en-US', { timeZone });
          
          // Now, create a new Date object from this local time string.
          // The JS engine will interpret this string as being in the server's local time.
          const localDate = new Date(localDateString);

          newRow[field] = localDate.toISOString();
        } catch (e) {
           // If parsing fails, leave the original value.
           console.error(`Failed to parse date field '${field}' with value '${newRow[field]}':`, e);
        }
      }
    });
    return newRow;
  });

  return { data: convertedData, error: null, count };
}