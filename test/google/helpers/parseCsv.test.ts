import { assertEquals } from "jsr:@std/assert";
import parseCsv from "../../../src/google/helpers/parseCsv.ts";

Deno.test("parses headers, rows, and empty fields", () => {
  assertEquals(parseCsv("name,city,note\nAlice,Toronto,\nBob,,Editor"), [
    { name: "Alice", city: "Toronto", note: "" },
    { name: "Bob", city: "", note: "Editor" },
  ]);
});

Deno.test("parses quoted delimiters and escaped quotes", () => {
  assertEquals(
    parseCsv('name,note\nAlice,"Toronto, Canada"\nBob,"Said ""hello"""'),
    [
      { name: "Alice", note: "Toronto, Canada" },
      { name: "Bob", note: 'Said "hello"' },
    ],
  );
});

Deno.test("parses embedded newlines and CRLF row endings", () => {
  assertEquals(
    parseCsv('name,note\r\nAlice,"first line\r\nsecond line"\r\nBob,done\r\n'),
    [
      { name: "Alice", note: "first line\r\nsecond line" },
      { name: "Bob", note: "done" },
    ],
  );
});
