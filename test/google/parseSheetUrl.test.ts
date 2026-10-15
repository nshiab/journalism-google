import { test, expect } from "vite-plus/test";
import parseSheetUrl from "../../src/google/helpers/parseSheetUrl.ts";
test("parses a sheet ID from the URL fragment", () => {
  expect(
    parseSheetUrl("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=123"),
  ).toEqual({ spreadsheetId: "spreadsheet-id", sheetId: 123 });
});
test("parses a sheet ID from the URL query", () => {
  expect(
    parseSheetUrl("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=123"),
  ).toEqual({ spreadsheetId: "spreadsheet-id", sheetId: 123 });
});
test("accepts matching query and fragment sheet IDs", () => {
  expect(
    parseSheetUrl("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=123#gid=123"),
  ).toEqual({ spreadsheetId: "spreadsheet-id", sheetId: 123 });
});
test("allows a spreadsheet URL without a sheet ID", () => {
  expect(parseSheetUrl("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit")).toEqual({
    spreadsheetId: "spreadsheet-id",
  });
});
test("rejects conflicting query and fragment sheet IDs", () => {
  expect(() =>
    parseSheetUrl("https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=1#gid=2"),
  ).toThrow("Ambiguous Google Sheets URL");
});
