import { test, expect, describe } from "vite-plus/test";
import overwriteSheetData from "../../src/google/overwriteSheetData.ts";
import getSheetData from "../../src/google/getSheetData.ts";
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0";
const originalData = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
  { first: "Graeme", last: "Bruce" },
  { first: "Dexter", last: "McMillan" },
];
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY;
describe.skipIf(process.env.CI === "true" || !email || !key)("live Google integration", () => {
  test("should return the data as an array of objects after skipping the first row", async () => {
    await overwriteSheetData(originalData, sheetUrl, {
      prepend: "Contact me for more info",
    });
    const data = await getSheetData(sheetUrl, { skip: 1 });
    expect(data).toEqual(originalData);
  });
});
