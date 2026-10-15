import { test, expect } from "vite-plus/test";
import parseCsv from "../../../src/google/helpers/parseCsv.ts";
test("parses headers, rows, and empty fields", () => {
  expect(parseCsv("name,city,note\nAlice,Toronto,\nBob,,Editor")).toEqual([
    { name: "Alice", city: "Toronto", note: "" },
    { name: "Bob", city: "", note: "Editor" },
  ]);
});
test("parses quoted delimiters and escaped quotes", () => {
  expect(parseCsv('name,note\nAlice,"Toronto, Canada"\nBob,"Said ""hello"""')).toEqual([
    { name: "Alice", note: "Toronto, Canada" },
    { name: "Bob", note: 'Said "hello"' },
  ]);
});
test("parses embedded newlines and CRLF row endings", () => {
  expect(parseCsv('name,note\r\nAlice,"first line\r\nsecond line"\r\nBob,done\r\n')).toEqual([
    { name: "Alice", note: "first line\r\nsecond line" },
    { name: "Bob", note: "done" },
  ]);
});
