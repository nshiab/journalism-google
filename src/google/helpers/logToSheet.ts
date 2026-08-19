import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import openSpreadsheet from "./openSpreadsheet.ts";

/**
 * Authenticates with Google Sheets and returns a worksheet object.
 * @param sheetUrl The URL of the Google Sheet.
 * @param options Optional authentication options.
 * @returns A GoogleSpreadsheetWorksheet object.
 */
export default async function logToSheet(
  sheetUrl: string,
  options: { apiEmail?: string; apiKey?: string } = {},
) {
  const { spreadsheet, sheetId } = await openSpreadsheet(sheetUrl, options);
  if (sheetId === undefined) {
    throw new Error("The Google Sheets URL must include a gid.");
  }
  const sheet = spreadsheet.sheetsById[sheetId];

  if (sheet === undefined) {
    throw new Error(
      `Sheet with ID ${sheetId} not found.`,
    );
  }

  return sheet as GoogleSpreadsheetWorksheet;
}
