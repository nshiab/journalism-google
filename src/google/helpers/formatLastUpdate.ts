export type CanadianTimeZone =
  | "Canada/Atlantic"
  | "Canada/Central"
  | "Canada/Eastern"
  | "Canada/Mountain"
  | "Canada/Newfoundland"
  | "Canada/Pacific"
  | "Canada/Saskatchewan"
  | "Canada/Yukon";

type FixedLabelTimeZone = Exclude<
  CanadianTimeZone | "UTC",
  "Canada/Newfoundland"
>;

const timeZoneLabels: Record<FixedLabelTimeZone, string> = {
  UTC: "UTC",
  "Canada/Atlantic": "AT",
  "Canada/Central": "CT",
  "Canada/Eastern": "ET",
  "Canada/Mountain": "MT",
  "Canada/Pacific": "PT",
  "Canada/Saskatchewan": "CT",
  "Canada/Yukon": "GMT-7",
};

export default function formatLastUpdate(
  date: Date,
  timeZone: CanadianTimeZone | "UTC" = "UTC",
): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );

  let timeZoneLabel: string;
  if (timeZone === "Canada/Newfoundland") {
    const offsetPart = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date).find(({ type }) => type === "timeZoneName");
    if (offsetPart === undefined) {
      throw new Error(`Could not format the ${timeZone} offset.`);
    }
    timeZoneLabel = offsetPart.value;
  } else {
    timeZoneLabel = timeZoneLabels[timeZone];
  }

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${timeZoneLabel}`;
}
