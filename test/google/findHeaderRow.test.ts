import { test, expect } from "vite-plus/test";
import appendRowsToTab, { findHeaderRow } from "../../src/google/helpers/appendRowsToTab.ts";
test("limits header discovery to the first 100 rows", async () => {
  let requestedRange = "";
  const sheet = {
    rowCount: 1000,
    lastColumnLetter: "Z",
    getCellsInRange(range: string) {
      requestedRange = range;
      return Promise.resolve([["first", "last"]]);
    },
    setHeaderRow() {
      return Promise.resolve();
    },
    loadHeaderRow() {
      return Promise.resolve();
    },
    addRows() {
      return Promise.resolve([]);
    },
  };
  await appendRowsToTab([{ first: "Nael", last: "Shiab" }], sheet, { raw: true });
  expect(requestedRange).toEqual("A1:Z100");
});
test("finds headers below metadata rows", () => {
  expect(
    findHeaderRow(
      [
        ["Data maintained by the newsroom"],
        ["Last update:", "2026-08-18"],
        ["first", "last"],
        ["Nael", "Shiab"],
      ],
      ["first", "last"],
    ),
  ).toEqual(3);
});
test("finds incoming headers among extra sheet columns", () => {
  expect(findHeaderRow([["id", "first", "last", "notes"]], ["first", "last"])).toEqual(1);
});
test("returns undefined when headers cannot be found", () => {
  expect(findHeaderRow([["first", "surname"]], ["first", "last"])).toEqual(undefined);
});
test("rejects ambiguous header rows", () => {
  expect(() =>
    findHeaderRow(
      [
        ["first", "last"],
        ["first", "last"],
      ],
      ["first", "last"],
    ),
  ).toThrow("Multiple possible header rows");
});
