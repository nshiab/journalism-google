import { assertEquals } from "jsr:@std/assert";
import formatLastUpdate, {
  type CanadianTimeZone,
} from "../../../src/google/helpers/formatLastUpdate.ts";

const standardTime = new Date("2024-01-15T12:34:56Z");

const standardTimeCases: [CanadianTimeZone, string][] = [
  ["Canada/Atlantic", "2024-01-15 08:34:56 AT"],
  ["Canada/Central", "2024-01-15 06:34:56 CT"],
  ["Canada/Eastern", "2024-01-15 07:34:56 ET"],
  ["Canada/Mountain", "2024-01-15 05:34:56 MT"],
  ["Canada/Newfoundland", "2024-01-15 09:04:56 GMT-3:30"],
  ["Canada/Pacific", "2024-01-15 04:34:56 PT"],
  ["Canada/Saskatchewan", "2024-01-15 06:34:56 CT"],
  ["Canada/Yukon", "2024-01-15 05:34:56 GMT-7"],
];

for (const [timeZone, expected] of standardTimeCases) {
  Deno.test(`formats standard time in ${timeZone}`, () => {
    assertEquals(formatLastUpdate(standardTime, timeZone), expected);
  });
}

Deno.test("formats UTC", () => {
  assertEquals(
    formatLastUpdate(standardTime),
    "2024-01-15 12:34:56 UTC",
  );
});

Deno.test("applies daylight time while preserving the time-zone abbreviation", () => {
  assertEquals(
    formatLastUpdate(
      new Date("2024-07-15T12:34:56Z"),
      "Canada/Eastern",
    ),
    "2024-07-15 08:34:56 ET",
  );
});

Deno.test("formats Newfoundland's daylight-time offset", () => {
  assertEquals(
    formatLastUpdate(
      new Date("2024-07-15T12:34:56Z"),
      "Canada/Newfoundland",
    ),
    "2024-07-15 10:04:56 GMT-2:30",
  );
});
