import cleanData from "./helpers/cleanData.ts";
import logToSheet from "./helpers/logToSheet.ts";
import warnDeprecated from "./helpers/warnDeprecated.ts";

/**
 * Appends new rows of data to an existing Google Sheet. This function is useful for continuously adding new records to a spreadsheet without overwriting existing data, such as logging events, collecting form submissions, or appending new data points to a time series.
 *
 * The function expects the data to be an array of objects, where the keys of these objects correspond to the column headers in your Google Sheet.
 *
 * By default, authentication is handled via environment variables (`GOOGLE_PRIVATE_KEY` and `GOOGLE_SERVICE_ACCOUNT_EMAIL`). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed setup instructions, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).
 *
 * @example
 * ```ts
 * import { addSheetRows } from "@nshiab/journalism-google";
 *
 * // The data needs to be an array of objects. The keys of the objects must match the sheet's columns.
 * const data = [
 *   { first: "Nael", last: "Shiab" },
 *   { first: "Andrew", last: "Ryan" }
 * ];
 *
 * // Fake URL used as an example.
 * const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";
 *
 * // Appending the new rows to the sheet.
 * await addSheetRows(data, sheetUrl);
 * console.log("Rows added successfully.");
 * ```
 * @example
 * ```ts
 * // Append data as raw values to prevent Google Sheets from interpreting them.
 * const rawData = [
 *   { product_id: '001', quantity: '05' }, // '05' might be interpreted as 5 without raw: true
 *   { product_id: '002', quantity: '10' }
 * ];
 * await addSheetRows(rawData, sheetUrl, { raw: true });
 * console.log("Raw rows added successfully.");
 * ```
 * @example
 * ```ts
 * // If your sheet's headers are on the second row (index 1).
 * const dataWithHeaderIndex = [
 *   { Name: "John Doe", Age: 30 }
 * ];
 * await addSheetRows(dataWithHeaderIndex, sheetUrl, { headerIndex: 1 });
 * console.log("Rows added with custom header index.");
 * ```
 * @example
 * ```ts
 * // Use custom environment variable names for the service-account credentials.
 * await addSheetRows(data, sheetUrl, {
 *   apiEmail: "GG_EMAIL",
 *   apiKey: "GG_KEY"
 * });
 * console.log("Rows added using custom API credentials.");
 * ```
 * @param data - An array of objects, where each object represents a row to be appended to the sheet. The keys of the objects should match the existing column headers in the sheet.
 * @param sheetUrl - The URL of the Google Sheet to which rows will be appended. This URL should point to a specific sheet (e.g., ending with `#gid=0`).
 * @param options - An optional object with configuration options:
 *   @param options.headerIndex - The 0-based index of the row that contains the headers in your sheet. By default, the first row (index 0) is considered the header. Use this if your headers are in a different row.
 *   @param options.raw - If `true`, data will be written as raw values, preventing Google Sheets from automatically guessing data types or applying formatting. This can be useful for preserving exact string representations. Defaults to `false`.
 *   @param options.apiEmail - Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
 *   @param options.apiKey - Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.
 * @returns A Promise that resolves when the rows have been successfully appended to the sheet.
 * @category Google
 * @deprecated Use `pushToSheet(data, sheetUrl, { mode: "append" })` instead.
 * This function may be removed in the next major release.
 */
export default async function addSheetRows(
  data: { [key: string]: string | number | boolean | Date | null }[],
  sheetUrl: string,
  options: {
    headerIndex?: number;
    raw?: boolean;
    apiEmail?: string;
    apiKey?: string;
  } = {},
): Promise<void> {
  warnDeprecated("addSheetRows", 'pushToSheet() with mode: "append"');
  const sheet = await logToSheet(sheetUrl, options);
  const headerRow = Object.keys(data[0]);
  await sheet.setHeaderRow(
    headerRow,
    typeof options.headerIndex === "number" ? options.headerIndex + 1 : 1,
  );
  await sheet.addRows(cleanData(data), { raw: options.raw });
}
