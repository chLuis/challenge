import { describe, expect, it } from "vitest";
import { formatAverage, formatLongDate, formatPercent, formatRelativeDay } from "@/lib/format";

// 10:00 on 24 Sep 2026 in Buenos Aires (UTC-3).
const now = new Date("2026-09-24T13:00:00Z");

describe("formatRelativeDay", () => {
  it("says hoy, ayer or how many days ago during the last week", () => {
    expect(formatRelativeDay("2026-09-24T12:00:00Z", now)).toBe("hoy");
    expect(formatRelativeDay("2026-09-23T12:00:00Z", now)).toBe("ayer");
    expect(formatRelativeDay("2026-09-20T12:00:00Z", now)).toBe("hace 4 días");
  });

  it("uses the calendar day in Buenos Aires, not the UTC one", () => {
    // 01:30 UTC on the 24th is still the 23rd in Buenos Aires.
    expect(formatRelativeDay("2026-09-24T01:30:00Z", now)).toBe("ayer");
  });

  it("names the day for older dates, adding the year only when it differs", () => {
    expect(formatRelativeDay("2026-09-02T19:40:00Z", now)).toBe("el 2 de septiembre");
    expect(formatRelativeDay("2025-12-30T15:00:00Z", now)).toBe("el 30 de diciembre de 2025");
  });
});

describe("formatLongDate", () => {
  it("names the weekday and the day in Buenos Aires", () => {
    expect(formatLongDate(now)).toBe("jueves 24 de septiembre");
    expect(formatLongDate(new Date("2026-09-25T01:00:00Z"))).toBe("jueves 24 de septiembre");
  });
});

describe("number formats", () => {
  it("writes averages and percentages the Argentine way", () => {
    expect(formatAverage(3.625)).toBe("3,63");
    expect(formatAverage(4)).toBe("4,0");
    expect(formatPercent(2 / 9)).toBe("22%");
  });
});
