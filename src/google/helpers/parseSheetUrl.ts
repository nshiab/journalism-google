export default function parseSheetUrl(sheetUrl: string): {
  spreadsheetId: string;
  sheetId?: number;
} {
  let url: URL;
  try {
    url = new URL(sheetUrl);
  } catch {
    throw new Error(`Invalid Google Sheets URL: ${sheetUrl}`);
  }

  const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  const spreadsheetId = match?.[1];
  if (spreadsheetId === undefined || spreadsheetId === "") {
    throw new Error(`Could not find a spreadsheet ID in URL: ${sheetUrl}`);
  }

  const querySheetId = url.searchParams.get("gid");
  const hashSheetId = new URLSearchParams(url.hash.slice(1)).get("gid");

  if (
    querySheetId !== null && hashSheetId !== null &&
    querySheetId !== hashSheetId
  ) {
    throw new Error(
      `Ambiguous Google Sheets URL: query gid=${querySheetId} does not match fragment gid=${hashSheetId}.`,
    );
  }

  const rawSheetId = hashSheetId ?? querySheetId;
  if (rawSheetId === null) {
    return { spreadsheetId };
  }
  if (!/^\d+$/.test(rawSheetId)) {
    throw new Error(`Invalid sheet ID in URL: gid=${rawSheetId}`);
  }

  return { spreadsheetId, sheetId: Number(rawSheetId) };
}
