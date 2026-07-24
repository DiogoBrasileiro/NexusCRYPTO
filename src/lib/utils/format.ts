// Pinned to the platform's default timezone (matches `users.timezone`'s
// default in the DB) rather than the server process's local timezone —
// otherwise the same stored instant renders as a different calendar date
// depending on which region the app happens to be deployed in.
const DEFAULT_TIMEZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: DEFAULT_TIMEZONE,
});
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: DEFAULT_TIMEZONE,
});

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return dateTimeFormatter.format(new Date(value));
}
