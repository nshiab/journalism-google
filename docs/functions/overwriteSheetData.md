[**Journalism Google v1.1.3**](../index.md)

***

[Journalism Google](../globals.md) / overwriteSheetData

# ~~Function: overwriteSheetData()~~

> **overwriteSheetData**(`data`, `sheetUrl`, `options?`): `Promise`\<`void`\>

Clears the content of a Google Sheet and then populates it with new data. This function is useful for regularly updating datasets in Google Sheets, ensuring that the sheet always reflects the latest information without manual intervention.

The function automatically infers column headers from the keys of the first object in your `data` array. It supports various options for customizing the update process, including adding a timestamp of the last update, prepending custom text, and controlling how Google Sheets interprets the data types.

By default, authentication is handled via environment variables (`GOOGLE_PRIVATE_KEY` and `GOOGLE_SERVICE_ACCOUNT_EMAIL`). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed setup instructions, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

## Parameters

### data

`object`[]

An array of objects to be written to the Google Sheet. The keys of the first object in this array will be used as column headers.

### sheetUrl

`string`

The URL of the Google Sheet to be updated. This URL should point to a specific sheet (e.g., ending with `#gid=0`).

### options?

An optional object with configuration options:

#### apiEmail?

`string`

Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

#### apiKey?

`string`

Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.

#### lastUpdate?

`boolean`

If `true`, a row indicating the date and time of the update will be added before the data. Defaults to `false`.

#### prepend?

`string`

A string to be added as a new row at the very top of the sheet, before any data or `lastUpdate` information. Useful for adding notes or disclaimers.

#### raw?

`boolean`

If `true`, data will be written as raw values, preventing Google Sheets from automatically guessing data types or applying formatting. This can be useful for preserving exact string representations. Defaults to `false`.

#### timeZone?

`"Canada/Atlantic"` \| `"Canada/Central"` \| `"Canada/Eastern"` \| `"Canada/Mountain"` \| `"Canada/Newfoundland"` \| `"Canada/Pacific"` \| `"Canada/Saskatchewan"` \| `"Canada/Yukon"`

If `lastUpdate` is `true`, this option allows you to specify a time zone for the timestamp (e.g., `"Canada/Eastern"`). If omitted, the date will be formatted in UTC.

## Returns

`Promise`\<`void`\>

A Promise that resolves when the sheet has been successfully cleared and populated with new data.

## Examples

```ts
import { overwriteSheetData } from "@nshiab/journalism-google";

// The data needs to be an array of objects. The keys of the first object will be used to create the header row.
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" }
];
// Fake URL used as an example.
const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Clearing the sheet and then populating it.
await overwriteSheetData(data, sheetUrl);
console.log("Sheet updated successfully with data.");
```

```ts
// Write data as raw values to prevent Google Sheets from interpreting them.
const rawData = [
  { id: '001', value: '05' }, // '05' might be interpreted as 5 without raw: true
  { id: '002', value: '10' }
];
await overwriteSheetData(rawData, sheetUrl, { raw: true });
console.log("Sheet updated successfully with raw data.");
```

```ts
// Add a timestamp of the update in UTC.
await overwriteSheetData(data, sheetUrl, { lastUpdate: true });
console.log("Sheet updated with UTC timestamp.");

// Add a timestamp formatted to a specific time zone.
await overwriteSheetData(data, sheetUrl, { lastUpdate: true, timeZone: "Canada/Eastern" });
console.log("Sheet updated with Eastern Time timestamp.");
```

```ts
// Add a custom message at the top of the sheet.
await overwriteSheetData(data, sheetUrl, { prepend: "For inquiries, contact data.team@example.com" });
console.log("Sheet updated with prepended text.");

// Combine prepend with last update and time zone.
await overwriteSheetData(data, sheetUrl, {
  prepend: "For inquiries, contact data.team@example.com",
  lastUpdate: true,
  timeZone: "Canada/Eastern"
});
console.log("Sheet updated with prepended text and timestamp.");
```

```ts
// Use custom environment variable names for the service-account credentials.
await overwriteSheetData(data, sheetUrl, {
  apiEmail: "GG_EMAIL",
  apiKey: "GG_KEY"
});
console.log("Sheet updated using custom API credentials.");
```

## Deprecated

Use `pushToSheet(data, sheetUrl, { mode: "overwrite" })` instead.
This function may be removed in the next major release.
