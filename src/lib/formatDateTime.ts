type FormatDateTimeOptions = {
  timeZone?: string;            // Default Asia/Manila
  format?: string;              // Default YYYY-MM-DD
  useDeviceTimeZone?: boolean;  // Default false
};

export function formatDateTime(
  input: string | Date,
  {
    timeZone = "Asia/Manila",
    format = "YYYY-MM-DD",
    useDeviceTimeZone = false,
  }: FormatDateTimeOptions = {}
): string {
  const date = new Date(input);

  const finalTimeZone = useDeviceTimeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timeZone;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: finalTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  const year = lookup.year;
  const month = lookup.month;
  const day = lookup.day;

  const hour24 = new Intl.DateTimeFormat("en-US", {
    timeZone: finalTimeZone,
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .find((p) => p.type === "hour")?.value ?? "00";

  const hour12 = lookup.hour ?? "00";
  const minute = lookup.minute ?? "00";
  const second = lookup.second ?? "00";
  const period = lookup.dayPeriod?.toUpperCase() ?? "";

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hour24) // 24-hour
    .replace("hh", hour12.padStart(2, "0")) // 12-hour
    .replace("mm", minute)
    .replace("ss", second)
    .replace("A", period);
}
