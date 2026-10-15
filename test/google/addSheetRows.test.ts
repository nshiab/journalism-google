import { test, expect, describe } from "vite-plus/test";
import addSheetRows from "../../src/google/addSheetRows.ts";
import getSheetData from "../../src/google/getSheetData.ts";
import overwriteSheetData from "../../src/google/overwriteSheetData.ts";
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
];
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit#gid=0";
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = process.env.GOOGLE_PRIVATE_KEY;
describe.skipIf(process.env.CI === "true" || !email || !key)("live Google integration", () => {
  test("appends rows using a custom header index", async () => {
    await overwriteSheetData(data, sheetUrl, { prepend: "Newsroom data" });
    await addSheetRows([{ first: "New", last: "Row" }], sheetUrl, { headerIndex: 1, raw: true });
    expect(await getSheetData(sheetUrl, { skip: 1 })).toEqual([
      ...data,
      { first: "New", last: "Row" },
    ]);
  });
});
