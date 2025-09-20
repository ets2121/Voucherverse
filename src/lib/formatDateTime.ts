
import { format as formatDateFns, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function formatDateTime(
  input: string | Date,
  options: {
    format?: string;
    timeZone?: string;
    useDeviceTimeZone?: boolean;
  } = {}
): string {
  const {
    format = 'YYYY-MM-DD',
    timeZone = 'Asia/Manila',
    useDeviceTimeZone = false,
  } = options;

  try {
    const date = typeof input === 'string' ? parseISO(input) : input;

    // Determine the target timezone
    const finalTimeZone = useDeviceTimeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : timeZone;

    // Convert the date to the target timezone
    const zonedDate = toZonedTime(date, finalTimeZone);

    // Format the zoned date
    return formatDateFns(zonedDate, format, { timeZone: finalTimeZone });

  } catch (error) {
    console.error("Error formatting date:", input, error);
    // Return a fallback or the original string if it's not a valid date
    return String(input);
  }
}
