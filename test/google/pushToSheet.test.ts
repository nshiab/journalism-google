import { test, expect, describe } from "vite-plus/test";
import getSheetData from "../../src/google/getSheetData.ts";
import { openSpreadsheet, pushToSheet } from "../../src/index.ts";
const data = [{ first: "Nael", last: "Shiab" }];
const sheetUrl = "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=0";
test("requires a tab title when creation is enabled", async () => {
  await expect(pushToSheet(data, sheetUrl, { create: true })).rejects.toThrow(
    "create option requires tabTitle",
  );
});
test("rejects an invalid mode", async () => {
  const result: unknown = Reflect.apply(pushToSheet, undefined, [
    data,
    sheetUrl,
    { mode: "replace" },
  ]);
  await expect(result).rejects.toThrow('Expected "overwrite" or "append"');
});

test("rejects an empty tab title", async () => {
  await expect(pushToSheet(data, sheetUrl, { tabTitle: "  " })).rejects.toThrow(
    "tabTitle cannot be empty",
  );
});
test("rejects prepended text in append mode", async () => {
  await expect(
    pushToSheet(data, sheetUrl, {
      mode: "append",
      prepend: "Newsroom data",
    }),
  ).rejects.toThrow("only available in overwrite mode");
});
test("rejects a last-update timestamp in append mode", async () => {
  await expect(
    pushToSheet(data, sheetUrl, {
      mode: "append",
      lastUpdate: true,
    }),
  ).rejects.toThrow("only available in overwrite mode");
});
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
describe.skipIf(
  process.env.CI === "true" ||
    ((!email || !privateKey) && !process.env.GOOGLE_APPLICATION_CREDENTIALS),
)("live Google integration", () => {
  test("overwrites and appends while discovering headers below metadata", async () => {
    const integrationSheetUrl =
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit?gid=0#gid=0";
    const rawData = [{ id: "001", formula: "=1+1" }];
    await pushToSheet(rawData, integrationSheetUrl, {
      prepend: "Push to sheet integration test",
      lastUpdate: "Canada/Eastern",
    });
    await pushToSheet([{ id: "002", formula: "+1+1" }], integrationSheetUrl, { mode: "append" });
    expect(await getSheetData(integrationSheetUrl, { skip: 2 })).toEqual([
      { id: "001", formula: "=1+1" },
      { id: "002", formula: "+1+1" },
    ]);
  });
  test("creates a missing titled tab", async () => {
    const spreadsheetUrl =
      "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit";
    const credentials = email && privateKey ? { email, privateKey } : undefined;
    const tabTitle = `pushToSheet-${crypto.randomUUID()}`;
    const { spreadsheet } = await openSpreadsheet(spreadsheetUrl, {
      credentials,
    });
    try {
      await expect(
        pushToSheet(data, spreadsheetUrl, {
          tabTitle,
          credentials,
        }),
      ).rejects.toThrow(`Tab titled "${tabTitle}" not found`);
      await pushToSheet(data, spreadsheetUrl, {
        mode: "append",
        tabTitle,
        create: true,
        credentials,
      });
      await spreadsheet.loadInfo();
      const createdTab = spreadsheet.sheetsByTitle[tabTitle];
      expect(createdTab).toBeDefined();
      await createdTab.loadHeaderRow();
      expect(createdTab.headerValues).toEqual(["first", "last"]);
      await pushToSheet([{ formula: "=1+1" }], `${spreadsheetUrl}?gid=0#gid=0`, {
        tabTitle,
        lastUpdate: true,
        raw: false,
        credentials,
      });
      const csv = await getSheetData(`${spreadsheetUrl}#gid=${createdTab.sheetId}`, {
        csv: true,
      });
      expect(csv).toMatch(/^Last update:,.* UTC\r\nformula,\r\n2,$/);
    } finally {
      await spreadsheet.loadInfo();
      await spreadsheet.sheetsByTitle[tabTitle]?.delete();
    }
  });
});
