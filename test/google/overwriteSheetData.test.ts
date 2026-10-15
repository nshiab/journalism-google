import { test, expect, describe } from "vite-plus/test";
import getSheetData from "../../src/google/getSheetData.ts";
import overwriteSheetData from "../../src/google/overwriteSheetData.ts";
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0";
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
];
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY;
describe.skipIf(process.env.CI === "true" || !email || !key)("live Google integration", () => {
  test("overwrites rows with a note and a last-update timestamp", async () => {
    await overwriteSheetData(data, sheetUrl, {
      prepend: "Newsroom data",
      lastUpdate: true,
      timeZone: "Canada/Eastern",
      raw: true,
    });
    expect(await getSheetData(sheetUrl, { skip: 2 })).toEqual(data);
    expect(await getSheetData(sheetUrl, { csv: true })).toMatch(
      /^Newsroom data,\r\nLast update:,.* ET\r\nfirst,last/,
    );
  });
});
