import { test, expect, describe } from "vite-plus/test";
import clearSheet from "../../src/google/clearSheet.ts";
import getSheetData from "../../src/google/getSheetData.ts";
import pushToSheet from "../../src/google/pushToSheet.ts";
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
];
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0";
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY;
describe.skipIf(
  process.env.CI === "true" || ((!email || !key) && !process.env.GOOGLE_APPLICATION_CREDENTIALS),
)("live Google integration", () => {
  test("should clear a sheet", async () => {
    await pushToSheet(data, sheetUrl, {
      prepend: "Hi",
      lastUpdate: "Canada/Eastern",
    });
    await clearSheet(sheetUrl);
    const testData = await getSheetData(sheetUrl);
    expect(testData).toEqual([]);
  });
});
