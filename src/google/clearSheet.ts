import logToSheet from "./helpers/logToSheet.ts";

/**
 * Removes all rows from a Google Sheet, effectively clearing its content.
 *
 * By default, this function attempts to authenticate using environment variables (`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the service account email). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed instructions on setting up credentials, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).
 *
 * @example
 * ```ts
 * // Fake URL used as an example.
 * const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";
 *
 * // Removing all rows from the sheet.
 * await clearSheet(sheetUrl);
 * console.log("Sheet cleared successfully.");
 * ```
 * @example
 * ```ts
 * // Use custom environment variable names for the service-account credentials.
 * await clearSheet(sheetUrl, {
 *   apiEmail: "GG_EMAIL",
 *   apiKey: "GG_KEY"
 * });
 * console.log("Sheet cleared using custom API credentials.");
 * ```
 * @param sheetUrl - The URL of the Google Sheet to clear. This URL should point to a specific sheet (e.g., ending with `#gid=0`).
 * @param options - An optional object with configuration options:
 *   @param options.apiEmail - Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
 *   @param options.apiKey - Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.
 * @returns A Promise that resolves when the sheet has been successfully cleared.
 * @category Google
 */
export default async function clearSheet(
  sheetUrl: string,
  options: { apiEmail?: string; apiKey?: string } = {},
): Promise<void> {
  const sheet = await logToSheet(sheetUrl, options);
  await sheet.clear();
}
