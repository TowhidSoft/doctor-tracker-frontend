import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (value?: string | null): string => (value ? dayjs(value).format("DD MMM YYYY") : "—");
export const fromNow = (value?: string | null): string => (value ? dayjs(value).fromNow() : "—");
export const shortDay = (value: string): string => dayjs(value).format("MMM D");

export const initials = (name?: string): string =>
  (name ?? "")
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
