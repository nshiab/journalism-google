import { assertEquals, assertThrows } from "jsr:@std/assert";
import appendRowsToTab, {
  findHeaderRow,
} from "../../src/google/helpers/appendRowsToTab.ts";

Deno.test("limits header discovery to the first 100 rows", async () => {
  let requestedRange = "";
  const sheet = {
    rowCount: 1_000,
    lastColumnLetter: "Z",
    getCellsInRange(range: string) {
      requestedRange = range;
      return Promise.resolve([["first", "last"]]);
    },
    loadHeaderRow() {
      return Promise.resolve();
    },
    addRows() {
      return Promise.resolve([]);
    },
  } as unknown as Parameters<typeof appendRowsToTab>[1];

  await appendRowsToTab(
    [{ first: "Nael", last: "Shiab" }],
    sheet,
    { raw: true },
  );

  assertEquals(requestedRange, "A1:Z100");
});

Deno.test("finds headers below metadata rows", () => {
  assertEquals(
    findHeaderRow([
      ["Data maintained by the newsroom"],
      ["Last update:", "2026-08-18"],
      ["first", "last"],
      ["Nael", "Shiab"],
    ], ["first", "last"]),
    3,
  );
});

Deno.test("finds incoming headers among extra sheet columns", () => {
  assertEquals(
    findHeaderRow([["id", "first", "last", "notes"]], ["first", "last"]),
    1,
  );
});

Deno.test("returns undefined when headers cannot be found", () => {
  assertEquals(
    findHeaderRow([["first", "surname"]], ["first", "last"]),
    undefined,
  );
});

Deno.test("rejects ambiguous header rows", () => {
  assertThrows(
    () =>
      findHeaderRow([
        ["first", "last"],
        ["first", "last"],
      ], ["first", "last"]),
    Error,
    "Multiple possible header rows",
  );
});
