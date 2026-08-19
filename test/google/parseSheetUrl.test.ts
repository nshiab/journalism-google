import { assertEquals, assertThrows } from "jsr:@std/assert";
import parseSheetUrl from "../../src/google/helpers/parseSheetUrl.ts";

Deno.test("parses a sheet ID from the URL fragment", () => {
  assertEquals(
    parseSheetUrl(
      "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=123",
    ),
    { spreadsheetId: "spreadsheet-id", sheetId: 123 },
  );
});

Deno.test("parses a sheet ID from the URL query", () => {
  assertEquals(
    parseSheetUrl(
      "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=123",
    ),
    { spreadsheetId: "spreadsheet-id", sheetId: 123 },
  );
});

Deno.test("accepts matching query and fragment sheet IDs", () => {
  assertEquals(
    parseSheetUrl(
      "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=123#gid=123",
    ),
    { spreadsheetId: "spreadsheet-id", sheetId: 123 },
  );
});

Deno.test("allows a spreadsheet URL without a sheet ID", () => {
  assertEquals(
    parseSheetUrl(
      "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit",
    ),
    { spreadsheetId: "spreadsheet-id" },
  );
});

Deno.test("rejects conflicting query and fragment sheet IDs", () => {
  assertThrows(
    () =>
      parseSheetUrl(
        "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit?gid=1#gid=2",
      ),
    Error,
    "Ambiguous Google Sheets URL",
  );
});
