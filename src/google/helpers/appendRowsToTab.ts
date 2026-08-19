import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import cleanData from "./cleanData.ts";

const MAX_HEADER_SEARCH_ROWS = 100;

export default async function appendRowsToTab(
  data: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  sheet: GoogleSpreadsheetWorksheet,
  options: { raw: boolean },
): Promise<void> {
  if (data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  if (headers.length === 0) {
    throw new Error("Data rows must contain at least one column.");
  }

  const lastHeaderSearchRow = Math.max(
    1,
    Math.min(sheet.rowCount, MAX_HEADER_SEARCH_ROWS),
  );
  const rows = (await sheet.getCellsInRange(
    `A1:${sheet.lastColumnLetter}${lastHeaderSearchRow}`,
  ) ?? []) as unknown[][];
  const headerRow = findHeaderRow(rows, headers);
  const isBlank = rows.every((row) =>
    row.every((value) => String(value ?? "") === "")
  );

  if (headerRow === undefined && !isBlank) {
    throw new Error(
      `Could not find a header row containing ${
        headers.join(", ")
      } within the first ${lastHeaderSearchRow} rows.`,
    );
  }
  if (headerRow === undefined) {
    await sheet.setHeaderRow(headers, 1);
  } else {
    await sheet.loadHeaderRow(headerRow);
  }

  await sheet.addRows(cleanData(data), { raw: options.raw });
}

export function findHeaderRow(
  rows: unknown[][],
  headers: string[],
): number | undefined {
  const matches = rows.flatMap((row, index) => {
    const values = new Set(
      row.map((value) => String(value ?? "").trim()),
    );
    return headers.every((header) => values.has(header)) ? [index + 1] : [];
  });

  if (matches.length > 1) {
    throw new Error(
      `Multiple possible header rows found (${matches.join(", ")}).`,
    );
  }

  return matches[0];
}
