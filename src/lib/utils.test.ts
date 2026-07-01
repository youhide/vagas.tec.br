import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatDistanceToNow } from "./utils";

describe("formatDistanceToNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function ago(ms: number): Date {
    return new Date(Date.now() - ms);
  }

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it.each([
    [30 * 1000, "agora mesmo"],
    [1 * MINUTE, "há 1 min"],
    [59 * MINUTE, "há 59 min"],
    [1 * HOUR, "há 1h"],
    [23 * HOUR, "há 23h"],
    [1 * DAY, "há 1 dia"],
    [6 * DAY, "há 6 dias"],
    [7 * DAY, "há 1 semana"],
    [21 * DAY, "há 3 semanas"],
    [31 * DAY, "há 1 mês"],
    [65 * DAY, "há 2 meses"],
    [400 * DAY, "há 1 ano"],
    [800 * DAY, "há 2 anos"],
  ])("%d ms atrás -> %s", (ms, expected) => {
    expect(formatDistanceToNow(ago(ms))).toBe(expected);
  });
});

describe("cn", () => {
  it("joins truthy classes and drops falsy values", () => {
    expect(cn("a", undefined, false, "b")).toBe("a b");
  });
});
