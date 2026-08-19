import process from "node:process";
import { existsSync, readFileSync } from "node:fs";

import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import parseSheetUrl from "./helpers/parseSheetUrl.ts";

/**
 * Opens a Google spreadsheet and returns its loaded representation. When the
 * URL identifies a specific tab with a `gid`, that ID is also returned as
 * `sheetId`; otherwise, `sheetId` is undefined.
 *
 * By default, authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
 * `GOOGLE_PRIVATE_KEY`. Alternatively, `GOOGLE_APPLICATION_CREDENTIALS` can
 * point to a service-account JSON file. Credentials passed through
 * `options.credentials` take precedence over both environment-based methods.
 * The service account must have access to the spreadsheet.
 *
 * To learn what you can do with the returned `spreadsheet`, refer to the
 * `node-google-spreadsheet` documentation:
 * [https://theoephraim.github.io/node-google-spreadsheet/#/](https://theoephraim.github.io/node-google-spreadsheet/#/).
 *
 * @param spreadsheetUrl A Google Sheets URL. It may identify a spreadsheet or
 * a specific tab.
 * @param options Controls authentication. The standard Google environment
 * variables are used when omitted.
 * @param options.credentials Explicit Google service-account credentials.
 * @param options.apiEmail Name of the environment variable containing the
 * service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
 * @param options.apiKey Name of the environment variable containing the
 * service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.
 * @returns The loaded spreadsheet and the tab ID found in the URL, if any.
 *
 * @example Open a spreadsheet using credentials from the environment.
 * ```ts
 * const { spreadsheet } = await openSpreadsheet(spreadsheetUrl);
 * console.log(spreadsheet.title);
 * ```
 *
 * @example Open a spreadsheet with explicit credentials.
 * ```ts
 * const { spreadsheet } = await openSpreadsheet(spreadsheetUrl, {
 *   credentials: {
 *     email: "service-account@project.iam.gserviceaccount.com",
 *     privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
 *   },
 * });
 * ```
 *
 * @example Access the tab selected by a URL containing a `gid`.
 * ```ts
 * const { spreadsheet, sheetId } = await openSpreadsheet(sheetUrl);
 * const sheet = sheetId === undefined
 *   ? spreadsheet.sheetsByIndex[0]
 *   : spreadsheet.sheetsById[sheetId];
 * ```
 *
 * @category Google
 */
export default async function openSpreadsheet(
  spreadsheetUrl: string,
  options: {
    credentials?: { email: string; privateKey: string };
    apiEmail?: string;
    apiKey?: string;
  } = {},
): Promise<{
  spreadsheet: InstanceType<
    (typeof import("google-spreadsheet"))["GoogleSpreadsheet"]
  >;
  sheetId?: number;
}> {
  const { spreadsheetId, sheetId } = parseSheetUrl(spreadsheetUrl);

  let email: string | undefined;
  let privateKey: string | undefined;

  if (options.credentials !== undefined) {
    email = options.credentials.email;
    privateKey = options.credentials.privateKey;
  } else if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS !== undefined &&
    process.env.GOOGLE_APPLICATION_CREDENTIALS !== "" &&
    existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ) {
    const credentials = JSON.parse(
      readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf-8"),
    );
    email = credentials.client_email;
    privateKey = credentials.private_key;
  } else {
    const emailVariable = options.apiEmail ?? "GOOGLE_SERVICE_ACCOUNT_EMAIL";
    const keyVariable = options.apiKey ?? "GOOGLE_PRIVATE_KEY";
    email = process.env[emailVariable];
    privateKey = process.env[keyVariable];
  }

  if (email === undefined || email === "") {
    throw new Error("Google service account email is undefined or empty.");
  }
  if (privateKey === undefined || privateKey === "") {
    throw new Error(
      "Google service account private key is undefined or empty.",
    );
  }

  const jwt = new JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const spreadsheet = new GoogleSpreadsheet(spreadsheetId, jwt);
  await spreadsheet.loadInfo();

  return { spreadsheet, sheetId };
}
