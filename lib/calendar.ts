import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  timezone?: string;
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startTime = dayjs(event.startTime).utc().format("YYYYMMDDTHHmmss") + "Z";
  const endTime = dayjs(event.endTime).utc().format("YYYYMMDDTHHmmss") + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startTime}/${endTime}`,
  });

  if (event.timezone) {
    params.append("ctz", event.timezone);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate ICS file content for Apple/Outlook Calendar
 */
export function generateICSFile(event: CalendarEvent): string {
  const startTime = dayjs(event.startTime).utc().format("YYYYMMDDTHHmmss") + "Z";
  const endTime = dayjs(event.endTime).utc().format("YYYYMMDDTHHmmss") + "Z";
  const timestamp = dayjs().utc().format("YYYYMMDDTHHmmss") + "Z";

  // Escape special characters in text fields
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Webinar Funnel Builder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${startTime}`,
    `DTEND:${endTime}`,
    `DTSTAMP:${timestamp}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Helper to determine webinar duration (default 60 minutes)
 */
export function calculateWebinarDuration(
  startTime: Date,
  durationMinutes: number = 60
): Date {
  return dayjs(startTime).add(durationMinutes, "minute").toDate();
}

/**
 * Format date for display
 */
export function formatWebinarDate(
  date: Date,
  timezone: string = "America/New_York"
): string {
  return dayjs(date).tz(timezone).format("MMMM D, YYYY [at] h:mm A z");
}
