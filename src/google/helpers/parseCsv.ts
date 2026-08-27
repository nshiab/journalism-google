/*
 * Adapted from d3-dsv 3.0.1: https://github.com/d3/d3-dsv
 *
 * Copyright 2013-2021 Mike Bostock
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

const EOL = Symbol("EOL");
const EOF = Symbol("EOF");
const QUOTE = 34;
const NEWLINE = 10;
const RETURN = 13;
const DELIMITER = 44;

export default function parseCsv(text: string): Record<string, string>[] {
  let columns: string[] = [];

  return parseRows(text, (row, index) => {
    if (index === 0) {
      columns = row;
      return undefined;
    }

    const record: Record<string, string> = {};
    for (let i = 0; i < columns.length; i += 1) {
      record[columns[i]] = row[i] || "";
    }
    return record;
  });
}

function parseRows<T>(
  text: string,
  convert: (row: string[], index: number) => T | undefined,
): T[] {
  const rows: T[] = [];
  let length = text.length;
  let index = 0;
  let rowIndex = 0;
  let eof = length <= 0;
  let eol = false;

  if (text.charCodeAt(length - 1) === NEWLINE) length -= 1;
  if (text.charCodeAt(length - 1) === RETURN) length -= 1;

  function token(): string | typeof EOL | typeof EOF {
    if (eof) return EOF;
    if (eol) {
      eol = false;
      return EOL;
    }

    let end: number;
    const start = index;
    let character: number;

    if (text.charCodeAt(start) === QUOTE) {
      while (
        (index++ < length && text.charCodeAt(index) !== QUOTE) ||
        text.charCodeAt(++index) === QUOTE
      );
      if ((end = index) >= length) {
        eof = true;
      } else if ((character = text.charCodeAt(index++)) === NEWLINE) {
        eol = true;
      } else if (character === RETURN) {
        eol = true;
        if (text.charCodeAt(index) === NEWLINE) index += 1;
      }
      return text.slice(start + 1, end - 1).replaceAll('""', '"');
    }

    while (index < length) {
      character = text.charCodeAt(end = index++);
      if (character === NEWLINE) {
        eol = true;
      } else if (character === RETURN) {
        eol = true;
        if (text.charCodeAt(index) === NEWLINE) index += 1;
      } else if (character !== DELIMITER) {
        continue;
      }
      return text.slice(start, end);
    }

    eof = true;
    return text.slice(start, length);
  }

  let value = token();
  while (value !== EOF) {
    const row: string[] = [];
    while (value !== EOL && value !== EOF) {
      row.push(value);
      value = token();
    }
    const converted = convert(row, rowIndex++);
    if (converted !== undefined) rows.push(converted);
    if (value === EOL) value = token();
  }

  return rows;
}
