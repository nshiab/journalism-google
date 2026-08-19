import process from "node:process";
import { existsSync, readFileSync } from "node:fs";

import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import parseSheetUrl from "./parseSheetUrl.ts";

export default async function openSpreadsheet(
  sheetUrl: string,
  options: {
    credentials?: { email: string; privateKey: string };
    apiEmail?: string;
    apiKey?: string;
  } = {},
) {
  const { spreadsheetId, sheetId } = parseSheetUrl(sheetUrl);

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
