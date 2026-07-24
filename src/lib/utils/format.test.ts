import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "./format";

describe("formatDate / formatDateTime", () => {
  it("returns an em dash placeholder for null/undefined instead of throwing", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDateTime(null)).toBe("—");
  });

  it("formats a real date in pt-BR day/month/year order, anchored to America/Sao_Paulo", () => {
    // 15:00 UTC is still the 15th in America/Sao_Paulo (UTC-3) — chosen to
    // avoid the date rolling over at the timezone boundary.
    expect(formatDate("2026-03-15T15:00:00.000Z")).toBe("15/03/2026");
  });

  it("formats a date-time including hour and minute", () => {
    const formatted = formatDateTime("2026-03-15T15:30:00.000Z");
    expect(formatted).toContain("15/03/2026");
    expect(formatted).toContain("12:30");
  });
});
