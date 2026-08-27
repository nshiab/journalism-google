import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import cleanData from "./cleanData.ts";
import formatLastUpdate from "./formatLastUpdate.ts";

export default async function overwriteTabData(
  data: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  sheet: GoogleSpreadsheetWorksheet,
  options: {
    prepend?: string;
    lastUpdate?:
      | boolean
      | "Canada/Atlantic"
      | "Canada/Central"
      | "Canada/Eastern"
      | "Canada/Mountain"
      | "Canada/Newfoundland"
      | "Canada/Pacific"
      | "Canada/Saskatchewan"
      | "Canada/Yukon";
    raw?: boolean;
  },
): Promise<void> {
  const headers = data.length === 0 ? [] : Object.keys(data[0]);
  if (data.length > 0 && headers.length === 0) {
    throw new Error("Data rows must contain at least one column.");
  }

  await sheet.clear();
  if (data.length === 0) return;

  let headerRow = 1;
  if (typeof options.prepend === "string" || options.lastUpdate) {
    await sheet.loadCells("A1:B2");
  }
  if (typeof options.prepend === "string") {
    sheet.getCellByA1(`A${headerRow}`).value = options.prepend;
    headerRow += 1;
  }
  if (options.lastUpdate) {
    sheet.getCellByA1(`A${headerRow}`).value = "Last update:";
    sheet.getCellByA1(`B${headerRow}`).value = typeof options.lastUpdate ===
        "string"
      ? formatLastUpdate(new Date(), options.lastUpdate)
      : formatLastUpdate(new Date());
    headerRow += 1;
  }
  if (typeof options.prepend === "string" || options.lastUpdate) {
    await sheet.saveUpdatedCells();
  }

  await sheet.setHeaderRow(headers, headerRow);
  await sheet.addRows(cleanData(data), { raw: options.raw ?? true });
}
