import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import appendRowsToTab from "./helpers/appendRowsToTab.ts";
import openSpreadsheet from "./helpers/openSpreadsheet.ts";
import overwriteTabData from "./helpers/overwriteTabData.ts";

/**
 * Writes data to a Google Sheets tab, either replacing its contents or
 * appending rows. The tab can be selected by the URL's `gid` or by title.
 * If a titled tab does not exist, creation must be explicitly enabled with
 * `create: true`. In append mode, column headers are detected automatically
 * within the first 100 rows of the tab.
 *
 * By default, authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
 * `GOOGLE_PRIVATE_KEY`. Alternatively, `GOOGLE_APPLICATION_CREDENTIALS` can
 * point to a service-account JSON file. Credentials passed through
 * `options.credentials` take precedence over both environment-based methods.
 * For detailed setup instructions, refer to the `node-google-spreadsheet`
 * authentication guide:
 * [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).
 *
 * @param data Rows of data. Object keys are used as column headers.
 * @param sheetUrl A Google Sheets URL. It may identify a spreadsheet or a
 * specific tab.
 * @param options Controls tab selection, writing, metadata, value parsing, and
 * authentication.
 * @param options.mode Whether to overwrite the tab or append rows. Defaults to
 * `"overwrite"`.
 * @param options.tabTitle Selects a tab by title instead of using the URL's
 * `gid`.
 * @param options.create Creates a missing titled tab. Requires `tabTitle` and
 * defaults to `false`.
 * @param options.prepend Adds text above the header row in overwrite mode.
 * @param options.lastUpdate Adds a UTC timestamp when `true`, or a timestamp in
 * the specified Canadian time zone. Available only in overwrite mode.
 * @param options.raw Writes values without Google Sheets interpretation.
 * Defaults to `true`.
 * @param options.credentials Explicit Google service-account credentials.
 * These values override `GOOGLE_APPLICATION_CREDENTIALS`,
 * `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.
 * @returns A promise that resolves when the data has been written.
 *
 * @example Overwrite the tab selected by the URL.
 * ```ts
 * await pushToSheet(data, sheetUrl);
 * ```
 *
 * @example Append rows to a tab selected by title.
 * ```ts
 * await pushToSheet(data, sheetUrl, {
 *   mode: "append",
 *   tabTitle: "Election results",
 * });
 * ```
 *
 * @example Create a missing tab and write a timestamp in Eastern time.
 * ```ts
 * await pushToSheet(data, sheetUrl, {
 *   tabTitle: "Election results",
 *   create: true,
 *   lastUpdate: "Canada/Eastern",
 * });
 * ```
 *
 * @category Google
 */
export default async function pushToSheet(
  data: {
    [key: string]: string | number | boolean | Date | null;
  }[],
  sheetUrl: string,
  options: {
    mode?: "overwrite" | "append";
    tabTitle?: string;
    create?: boolean;
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
    credentials?: {
      email: string;
      privateKey: string;
    };
  } = {},
): Promise<void> {
  const mode = options.mode ?? "overwrite";
  if (mode !== "overwrite" && mode !== "append") {
    throw new Error(
      `Invalid mode: ${mode}. Expected "overwrite" or "append".`,
    );
  }
  if (options.tabTitle !== undefined && options.tabTitle.trim() === "") {
    throw new Error("tabTitle cannot be empty.");
  }
  if (options.create && options.tabTitle === undefined) {
    throw new Error("The create option requires tabTitle.");
  }
  if (
    mode === "append" &&
    (typeof options.prepend === "string" || options.lastUpdate)
  ) {
    throw new Error(
      "prepend and lastUpdate are only available in overwrite mode.",
    );
  }

  const { spreadsheet, sheetId } = await openSpreadsheet(sheetUrl, {
    credentials: options.credentials,
  });

  let sheet: GoogleSpreadsheetWorksheet | undefined;
  if (options.tabTitle !== undefined) {
    sheet = spreadsheet.sheetsByTitle[options.tabTitle];
    if (sheet === undefined && options.create) {
      sheet = await spreadsheet.addSheet({ title: options.tabTitle });
    } else if (sheet === undefined) {
      throw new Error(
        `Tab titled "${options.tabTitle}" not found. Pass create: true to create it.`,
      );
    }
  } else {
    if (sheetId === undefined) {
      throw new Error(
        "The Google Sheets URL must include a gid when tabTitle is not provided.",
      );
    }
    sheet = spreadsheet.sheetsById[sheetId];
    if (sheet === undefined) {
      throw new Error(`Sheet with ID ${sheetId} not found.`);
    }
  }

  if (mode === "overwrite") {
    await overwriteTabData(data, sheet, options);
  } else {
    await appendRowsToTab(data, sheet, { raw: options.raw ?? true });
  }
}
