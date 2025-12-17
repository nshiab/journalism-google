# API Reference

## addSheetRows

Appends new rows of data to an existing Google Sheet. This function is useful
for continuously adding new records to a spreadsheet without overwriting
existing data, such as logging events, collecting form submissions, or appending
new data points to a time series.

The function expects the data to be an array of objects, where the keys of these
objects correspond to the column headers in your Google Sheet.

By default, authentication is handled via environment variables
(`GOOGLE_PRIVATE_KEY` and `GOOGLE_SERVICE_ACCOUNT_EMAIL`). Alternatively, you
can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON
file. For detailed setup instructions, refer to the `node-google-spreadsheet`
authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

### Signature

```typescript
async function addSheetRows(
  data: Record<string, string | number | boolean | Date | null>[],
  sheetUrl: string,
  options?: {
    headerIndex?: number;
    raw?: boolean;
    apiEmail?: string;
    apiKey?: string;
  },
): Promise<void>;
```

### Parameters

- **`data`**: - An array of objects, where each object represents a row to be
  appended to the sheet. The keys of the objects should match the existing
  column headers in the sheet.
- **`sheetUrl`**: - The URL of the Google Sheet to which rows will be appended.
  This URL should point to a specific sheet (e.g., ending with `#gid=0`).
- **`options`**: - An optional object with configuration options:
- **`options.headerIndex`**: - The 0-based index of the row that contains the
  headers in your sheet. By default, the first row (index 0) is considered the
  header. Use this if your headers are in a different row.
- **`options.raw`**: - If `true`, data will be written as raw values, preventing
  Google Sheets from automatically guessing data types or applying formatting.
  This can be useful for preserving exact string representations. Defaults to
  `false`.
- **`options.apiEmail`**: - Optional. Your Google Service Account email. If
  provided, this will override the `process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL`
  environment variable.
- **`options.apiKey`**: - Optional. Your Google Service Account private key. If
  provided, this will override the `process.env.GOOGLE_PRIVATE_KEY` environment
  variable.

### Returns

A Promise that resolves when the rows have been successfully appended to the
sheet.

### Examples

```ts
// The data needs to be an array of objects. The keys of the objects must match the sheet's columns.
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
];

// Fake URL used as an example.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Appending the new rows to the sheet.
await addSheetRows(data, sheetUrl);
console.log("Rows added successfully.");
```

```ts
// Append data as raw values to prevent Google Sheets from interpreting them.
const rawData = [
  { product_id: "001", quantity: "05" }, // '05' might be interpreted as 5 without raw: true
  { product_id: "002", quantity: "10" },
];
await addSheetRows(rawData, sheetUrl, { raw: true });
console.log("Raw rows added successfully.");
```

```ts
// If your sheet's headers are on the second row (index 1).
const dataWithHeaderIndex = [
  { Name: "John Doe", Age: 30 },
];
await addSheetRows(dataWithHeaderIndex, sheetUrl, { headerIndex: 1 });
console.log("Rows added with custom header index.");
```

```ts
// Use explicitly provided API credentials instead of environment variables.
await addSheetRows(data, sheetUrl, {
  apiEmail: "your-service-account@project-id.iam.gserviceaccount.com",
  apiKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
});
console.log("Rows added using custom API credentials.");
```

## deleteFromBucket

Deletes a specified file from a Google Cloud Storage (GCS) bucket.

The function requires the Google Cloud project ID and the target bucket name.
These can be provided either through environment variables (`BUCKET_PROJECT` and
`BUCKET_NAME`) or directly as parameters in the `options` object. Parameters
passed in `options` will take precedence over environment variables.

By default, if the specified file does not exist in the bucket, the function
will throw an error. However, you can suppress this behavior by setting the
`try` option to `true`, which will cause the function to complete silently if
the file is not found.

### Signature

```typescript
async function deleteFromBucket(
  destination: string,
  options?: { project?: string; bucket?: string; try?: boolean },
): Promise<void>;
```

### Parameters

- **`destination`**: The full path to the file within the bucket (e.g.,
  'my-folder/my-file.txt').
- **`options`**: Optional configuration for the deletion operation.
- **`options.project`**: The Google Cloud project ID. If not provided, it
  defaults to the `BUCKET_PROJECT` environment variable.
- **`options.bucket`**: The name of the Google Cloud Storage bucket. If not
  provided, it defaults to the `BUCKET_NAME` environment variable.
- **`options.try`**: If `true`, the function will not throw an error if the file
  to be deleted does not exist. Defaults to `false`.

### Examples

```ts
// Basic usage: Delete a file from the bucket.
await deleteFromBucket("path/to/your/file.txt");
```

```ts
// Delete a file, suppressing errors if it doesn't exist.
await deleteFromBucket("path/to/non-existent-file.txt", { try: true });
```

```ts
// Explicitly specify project ID and bucket name.
await deleteFromBucket("reports/2023-summary.pdf", {
  project: "my-gcp-project-id",
  bucket: "my-data-bucket",
});
```

## downloadFromBucket

Downloads a file from a Google Cloud Storage (GCS) bucket to a specified local
path. This function provides robust handling for existing local files, allowing
you to skip downloads or overwrite files as needed.

The function requires the Google Cloud project ID and the target bucket name.
These can be provided either through environment variables (`BUCKET_PROJECT` and
`BUCKET_NAME`) or directly as parameters in the `options` object. Parameters
passed in `options` will take precedence over environment variables.

By default, if a local file with the same name already exists at the
`destination` path, the function will throw an error to prevent accidental
overwrites. You can modify this behavior using the `skip` or `overwrite`
options.

### Signature

```typescript
async function downloadFromBucket(
  source: string,
  destination: string,
  options?: {
    project?: string;
    bucket?: string;
    overwrite?: boolean;
    skip?: boolean;
  },
): Promise<void>;
```

### Parameters

- **`source`**: The path to the file within the GCS bucket (e.g.,
  'my-folder/document.pdf').
- **`destination`**: The local file path where the downloaded file will be saved
  (e.g., './downloads/document.pdf').
- **`options`**: Optional configuration for the download operation.
- **`options.project`**: The Google Cloud project ID. If not provided, it
  defaults to the `BUCKET_PROJECT` environment variable.
- **`options.bucket`**: The name of the Google Cloud Storage bucket. If not
  provided, it defaults to the `BUCKET_NAME` environment variable.
- **`options.overwrite`**: If `true`, an existing local file at the
  `destination` path will be overwritten. Cannot be used with `skip`. Defaults
  to `false`.
- **`options.skip`**: If `true`, the download will be skipped if a local file
  already exists at the `destination` path. Cannot be used with `overwrite`.
  Defaults to `false`.

### Examples

```ts
// Basic usage: Download a file.
await downloadFromBucket(
  "reports/annual-report.pdf",
  "./local-reports/annual-report.pdf",
);
console.log("File downloaded successfully!");
```

```ts
// Skip download if the file already exists locally.
await downloadFromBucket("images/profile.jpg", "./local-images/profile.jpg", {
  skip: true,
});
console.log("Download skipped if file exists, or downloaded otherwise.");
```

```ts
// Overwrite an existing local file.
await downloadFromBucket(
  "data/latest-data.csv",
  "./local-data/latest-data.csv",
  { overwrite: true },
);
console.log("File downloaded and overwritten if it existed.");
```

```ts
// Specify project and bucket explicitly.
await downloadFromBucket(
  "configs/app-settings.json",
  "./local-configs/settings.json",
  {
    project: "my-gcp-project",
    bucket: "my-config-bucket",
  },
);
```

## filesInBucket

Lists files within a Google Cloud Storage (GCS) bucket. You can list all files
in the bucket or narrow down the results to a specific folder. The function can
also return the full Google Storage URIs for each file.

This function requires the Google Cloud project ID and the target bucket name.
These can be provided either through environment variables (`BUCKET_PROJECT` and
`BUCKET_NAME`) or directly as parameters in the `options` object. Parameters
passed in `options` will take precedence over environment variables.

### Signature

```typescript
async function filesInBucket(
  options?: {
    folder?: string;
    project?: string;
    bucket?: string;
    URI?: boolean;
  },
): Promise<string[]>;
```

### Parameters

- **`options`**: Optional configuration for listing files.
- **`options.folder`**: The path to a specific folder within the bucket (e.g.,
  'my-data/'). Only files within this folder will be listed.
- **`options.project`**: The Google Cloud project ID. If not provided, it
  defaults to the `BUCKET_PROJECT` environment variable.
- **`options.bucket`**: The name of the Google Cloud Storage bucket. If not
  provided, it defaults to the `BUCKET_NAME` environment variable.
- **`options.URI`**: If `true`, the function will return the full Google Storage
  URI (e.g., 'gs://your-bucket/path/to/file.txt') for each file. Defaults to
  `false`, returning just the file path within the bucket.

### Returns

An array of strings, where each string is either the file path within the bucket
or its full Google Storage URI, depending on the `URI` option.

### Examples

```ts
// List all files in the default bucket.
const allFiles = await filesInBucket();
console.log("All files:", allFiles);
```

```ts
// List files within a specific folder.
const folderFiles = await filesInBucket({ folder: "images/thumbnails/" });
console.log("Files in folder:", folderFiles);
```

```ts
// Get Google Storage URIs for files in a folder.
const fileURIs = await filesInBucket({ folder: "documents/", URI: true });
console.log("File URIs:", fileURIs);
```

```ts
// Explicitly specify project and bucket.
const specificBucketFiles = await filesInBucket({
  project: "my-gcp-project",
  bucket: "my-archive-bucket",
  folder: "old-data/",
});
console.log("Files from specific bucket:", specificBucketFiles);
```

## getSheetData

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables
(`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the
service account email). Alternatively, you can use
`GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For
detailed instructions on setting up credentials, refer to the
`node-google-spreadsheet` authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

### Signature

```typescript
function getSheetData(
  sheetUrl: string,
  options: { csv: true; skip?: number; apiEmail?: string; apiKey?: string },
): Promise<string>;
```

### Parameters

- **`sheetUrl`**: - The URL of the Google Sheet from which to retrieve data.
  This URL should point to a specific sheet (e.g., ending with `#gid=0`).
- **`options`**: - An optional object with configuration options:
- **`options.skip`**: - The number of rows to skip from the beginning of the
  sheet before parsing the data. This is useful for sheets that have metadata at
  the top. Defaults to `0`.
- **`options.csv`**: - If `true`, the function will return the raw data as a CSV
  string. If `false` or omitted, it will return an array of objects, where each
  object represents a row and keys correspond to column headers. Defaults to
  `false`.
- **`options.apiEmail`**: - Optional. Your Google Service Account email. If
  provided, this will override the `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment
  variable.
- **`options.apiKey`**: - Optional. Your Google Service Account private key. If
  provided, this will override the `GOOGLE_PRIVATE_KEY` environment variable.

### Returns

A Promise that resolves to either an array of objects
(`Record<string, string>[]`) if `options.csv` is `false`, or a CSV string
(`string`) if `options.csv` is `true`.

### Examples

```ts
// Fake URL used as an example.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Returning the data as an array of objects.
const data = await getSheetData(sheetUrl);
console.log(data);
// Expected output (example):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Retrieve data, skipping the first row (e.g., if it contains metadata).
const dataSkippingFirstRow = await getSheetData(sheetUrl, { skip: 1 });
console.log(dataSkippingFirstRow);
// Expected output (example, assuming first row was metadata):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Return the data as a raw CSV string, useful for direct writing to files or other systems.
const csvString = await getSheetData(sheetUrl, { csv: true });
console.log(csvString);
// Expected output (example):
// "Header1,Header2\nValue1,Value2\nValue3,Value4"
```

```ts
// Use custom environment variable names for API email and key.
const dataWithCustomCredentials = await getSheetData(sheetUrl, {
  apiEmail: "GG_EMAIL",
  apiKey: "GG_KEY",
});
console.log(dataWithCustomCredentials);
```

## getSheetData

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables
(`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the
service account email). Alternatively, you can use
`GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For
detailed instructions on setting up credentials, refer to the
`node-google-spreadsheet` authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

### Signature

```typescript
function getSheetData(
  sheetUrl: string,
  options?: { csv?: false; skip?: number; apiEmail?: string; apiKey?: string },
): Promise<Record<string, string>[]>;
```

### Parameters

- **`sheetUrl`**: - The URL of the Google Sheet from which to retrieve data.
  This URL should point to a specific sheet (e.g., ending with `#gid=0`).
- **`options`**: - An optional object with configuration options:
- **`options.skip`**: - The number of rows to skip from the beginning of the
  sheet before parsing the data. This is useful for sheets that have metadata at
  the top. Defaults to `0`.
- **`options.csv`**: - If `true`, the function will return the raw data as a CSV
  string. If `false` or omitted, it will return an array of objects, where each
  object represents a row and keys correspond to column headers. Defaults to
  `false`.
- **`options.apiEmail`**: - Optional. Your Google Service Account email. If
  provided, this will override the `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment
  variable.
- **`options.apiKey`**: - Optional. Your Google Service Account private key. If
  provided, this will override the `GOOGLE_PRIVATE_KEY` environment variable.

### Returns

A Promise that resolves to either an array of objects
(`Record<string, string>[]`) if `options.csv` is `false`, or a CSV string
(`string`) if `options.csv` is `true`.

### Examples

```ts
// Fake URL used as an example.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Returning the data as an array of objects.
const data = await getSheetData(sheetUrl);
console.log(data);
// Expected output (example):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Retrieve data, skipping the first row (e.g., if it contains metadata).
const dataSkippingFirstRow = await getSheetData(sheetUrl, { skip: 1 });
console.log(dataSkippingFirstRow);
// Expected output (example, assuming first row was metadata):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Return the data as a raw CSV string, useful for direct writing to files or other systems.
const csvString = await getSheetData(sheetUrl, { csv: true });
console.log(csvString);
// Expected output (example):
// "Header1,Header2\nValue1,Value2\nValue3,Value4"
```

```ts
// Use custom environment variable names for API email and key.
const dataWithCustomCredentials = await getSheetData(sheetUrl, {
  apiEmail: "GG_EMAIL",
  apiKey: "GG_KEY",
});
console.log(dataWithCustomCredentials);
```

## getSheetData

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables
(`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the
service account email). Alternatively, you can use
`GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For
detailed instructions on setting up credentials, refer to the
`node-google-spreadsheet` authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

### Signature

```typescript
async function getSheetData(
  sheetUrl: string,
  options?: {
    csv?: boolean;
    skip?: number;
    apiEmail?: string;
    apiKey?: string;
  },
): Promise<Record<string, string>[] | string>;
```

### Parameters

- **`sheetUrl`**: - The URL of the Google Sheet from which to retrieve data.
  This URL should point to a specific sheet (e.g., ending with `#gid=0`).
- **`options`**: - An optional object with configuration options:
- **`options.skip`**: - The number of rows to skip from the beginning of the
  sheet before parsing the data. This is useful for sheets that have metadata at
  the top. Defaults to `0`.
- **`options.csv`**: - If `true`, the function will return the raw data as a CSV
  string. If `false` or omitted, it will return an array of objects, where each
  object represents a row and keys correspond to column headers. Defaults to
  `false`.
- **`options.apiEmail`**: - Optional. Your Google Service Account email. If
  provided, this will override the `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment
  variable.
- **`options.apiKey`**: - Optional. Your Google Service Account private key. If
  provided, this will override the `GOOGLE_PRIVATE_KEY` environment variable.

### Returns

A Promise that resolves to either an array of objects
(`Record<string, string>[]`) if `options.csv` is `false`, or a CSV string
(`string`) if `options.csv` is `true`.

### Examples

```ts
// Fake URL used as an example.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Returning the data as an array of objects.
const data = await getSheetData(sheetUrl);
console.log(data);
// Expected output (example):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Retrieve data, skipping the first row (e.g., if it contains metadata).
const dataSkippingFirstRow = await getSheetData(sheetUrl, { skip: 1 });
console.log(dataSkippingFirstRow);
// Expected output (example, assuming first row was metadata):
// [
//   { Header1: 'Value1', Header2: 'Value2' },
//   { Header1: 'Value3', Header2: 'Value4' }
// ]
```

```ts
// Return the data as a raw CSV string, useful for direct writing to files or other systems.
const csvString = await getSheetData(sheetUrl, { csv: true });
console.log(csvString);
// Expected output (example):
// "Header1,Header2\nValue1,Value2\nValue3,Value4"
```

```ts
// Use custom environment variable names for API email and key.
const dataWithCustomCredentials = await getSheetData(sheetUrl, {
  apiEmail: "GG_EMAIL",
  apiKey: "GG_KEY",
});
console.log(dataWithCustomCredentials);
```

## inBucket

Checks if a specified file exists within a Google Cloud Storage (GCS) bucket.
This function provides a straightforward way to verify the presence of a file in
your GCS infrastructure, which is useful for conditional operations, data
validation, or status checks.

Authentication and bucket identification can be configured either through
environment variables (`BUCKET_PROJECT` for the Google Cloud Project ID and
`BUCKET_NAME` for the bucket name) or by passing them directly as options to the
function. Options provided directly will take precedence over environment
variables.

### Signature

```typescript
async function inBucket(
  destination: string,
  options?: { project?: string; bucket?: string },
): Promise<boolean>;
```

### Parameters

- **`destination`**: - The full path to the file within the bucket (e.g.,
  'my-folder/my-file.txt').
- **`options`**: - Optional settings for configuring the GCS client.
- **`options.project`**: - Your Google Cloud Project ID. If not provided, it
  defaults to the `BUCKET_PROJECT` environment variable.
- **`options.bucket`**: - The name of the Google Cloud Storage bucket. If not
  provided, it defaults to the `BUCKET_NAME` environment variable.

### Returns

A Promise that resolves to `true` if the file exists in the bucket, and `false`
otherwise.

### Examples

```ts
// Check if a file exists in the default Google Cloud Storage bucket (configured via environment variables).
const exists = await inBucket("remote/file.txt");
if (exists) {
  console.log("File exists in the bucket.");
} else {
  console.log("File does not exist in the bucket.");
}
```

```ts
// Check for a file's existence in a specified project and bucket, overriding environment variables.
const existsInSpecificBucket = await inBucket("remote/file.txt", {
  project: "my-gcp-project",
  bucket: "my-bucket-name",
});
if (existsInSpecificBucket) {
  console.log("File exists in the specified bucket.");
} else {
  console.log("File does not exist in the specified bucket.");
}
```

## overwriteSheetData

Clears the content of a Google Sheet and then populates it with new data. This
function is useful for regularly updating datasets in Google Sheets, ensuring
that the sheet always reflects the latest information without manual
intervention.

The function automatically infers column headers from the keys of the first
object in your `data` array. It supports various options for customizing the
update process, including adding a timestamp of the last update, prepending
custom text, and controlling how Google Sheets interprets the data types.

By default, authentication is handled via environment variables
(`GOOGLE_PRIVATE_KEY` and `GOOGLE_SERVICE_ACCOUNT_EMAIL`). Alternatively, you
can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON
file. For detailed setup instructions, refer to the `node-google-spreadsheet`
authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

### Signature

```typescript
async function overwriteSheetData(
  data: Record<string, string | number | boolean | Date | null>[],
  sheetUrl: string,
  options?: {
    prepend?: string;
    lastUpdate?: boolean;
    timeZone?:
      | "Canada/Atlantic"
      | "Canada/Central"
      | "Canada/Eastern"
      | "Canada/Mountain"
      | "Canada/Newfoundland"
      | "Canada/Pacific"
      | "Canada/Saskatchewan"
      | "Canada/Yukon";
    raw?: boolean;
    apiEmail?: string;
    apiKey?: string;
  },
): Promise<void>;
```

### Parameters

- **`data`**: - An array of objects to be written to the Google Sheet. The keys
  of the first object in this array will be used as column headers.
- **`sheetUrl`**: - The URL of the Google Sheet to be updated. This URL should
  point to a specific sheet (e.g., ending with `#gid=0`).
- **`options`**: - An optional object with configuration options:
- **`options.prepend`**: - A string to be added as a new row at the very top of
  the sheet, before any data or `lastUpdate` information. Useful for adding
  notes or disclaimers.
- **`options.lastUpdate`**: - If `true`, a row indicating the date and time of
  the update will be added before the data. Defaults to `false`.
- **`options.timeZone`**: - If `lastUpdate` is `true`, this option allows you to
  specify a time zone for the timestamp (e.g., `"Canada/Eastern"`). If omitted,
  the date will be formatted in UTC.
- **`options.raw`**: - If `true`, data will be written as raw values, preventing
  Google Sheets from automatically guessing data types or applying formatting.
  This can be useful for preserving exact string representations. Defaults to
  `false`.
- **`options.apiEmail`**: - Optional. Your Google Service Account email. If
  provided, this will override the `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment
  variable.
- **`options.apiKey`**: - Optional. Your Google Service Account private key. If
  provided, this will override the `GOOGLE_PRIVATE_KEY` environment variable.

### Returns

A Promise that resolves when the sheet has been successfully cleared and
populated with new data.

### Examples

```ts
// The data needs to be an array of objects. The keys of the first object will be used to create the header row.
const data = [
  { first: "Nael", last: "Shiab" },
  { first: "Andrew", last: "Ryan" },
];
// Fake URL used as an example.
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

// Clearing the sheet and then populating it.
await overwriteSheetData(data, sheetUrl);
console.log("Sheet updated successfully with data.");
```

```ts
// Write data as raw values to prevent Google Sheets from interpreting them.
const rawData = [
  { id: "001", value: "05" }, // '05' might be interpreted as 5 without raw: true
  { id: "002", value: "10" },
];
await overwriteSheetData(rawData, sheetUrl, { raw: true });
console.log("Sheet updated successfully with raw data.");
```

```ts
// Add a timestamp of the update in UTC.
await overwriteSheetData(data, sheetUrl, { lastUpdate: true });
console.log("Sheet updated with UTC timestamp.");

// Add a timestamp formatted to a specific time zone.
await overwriteSheetData(data, sheetUrl, {
  lastUpdate: true,
  timeZone: "Canada/Eastern",
});
console.log("Sheet updated with Eastern Time timestamp.");
```

```ts
// Add a custom message at the top of the sheet.
await overwriteSheetData(data, sheetUrl, {
  prepend: "For inquiries, contact data.team@example.com",
});
console.log("Sheet updated with prepended text.");

// Combine prepend with last update and time zone.
await overwriteSheetData(data, sheetUrl, {
  prepend: "For inquiries, contact data.team@example.com",
  lastUpdate: true,
  timeZone: "Canada/Eastern",
});
console.log("Sheet updated with prepended text and timestamp.");
```

```ts
// Use explicitly provided API credentials instead of environment variables.
await overwriteSheetData(data, sheetUrl, {
  apiEmail: "your-service-account@project-id.iam.gserviceaccount.com",
  apiKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
});
console.log("Sheet updated using custom API credentials.");
```

## toBucket

Uploads a local file to a Google Cloud Storage (GCS) bucket and returns the URI
of the uploaded file. This function provides robust control over the upload
process, including options for skipping uploads if the file already exists,
overwriting existing files, and setting custom metadata.

By default, if a file with the same destination path already exists in the
bucket, an error will be thrown to prevent accidental overwrites. You can modify
this behavior using the `skip` or `overwrite` options.

Authentication and bucket identification can be configured either through
environment variables (`BUCKET_PROJECT` for the Google Cloud Project ID and
`BUCKET_NAME` for the bucket name) or by passing them directly as options to the
function. Options provided directly will take precedence over environment
variables.

### Signature

```typescript
async function toBucket(
  file: string,
  destination: string,
  options?: {
    project?: string;
    bucket?: string;
    metadata?: UploadOptions["metadata"];
    overwrite?: boolean;
    skip?: boolean;
  },
): Promise<string>;
```

### Parameters

- **`file`**: - The absolute or relative path to the local file that you want to
  upload.
- **`destination`**: - The desired path and filename for the file within the GCS
  bucket (e.g., `"my-folder/my-uploaded-file.txt"`).
- **`options`**: - Optional settings to customize the upload behavior.
- **`options.project`**: - Your Google Cloud Project ID. If not provided, it
  defaults to the `BUCKET_PROJECT` environment variable.
- **`options.bucket`**: - The name of the Google Cloud Storage bucket. If not
  provided, it defaults to the `BUCKET_NAME` environment variable.
- **`options.metadata`**: - An object containing custom metadata to be
  associated with the uploaded file (e.g., `contentType`, `cacheControl`). This
  is passed directly to the GCS upload options.
- **`options.overwrite`**: - If `true`, an existing file at the `destination`
  path in the bucket will be overwritten. Cannot be used with `skip: true`.
  Defaults to `false`.
- **`options.skip`**: - If `true`, the upload will be skipped if a file with the
  same `destination` path already exists in the bucket. If the local file does
  not exist but the remote file does, the URI of the remote file will be
  returned without an error. Cannot be used with `overwrite: true`. Defaults to
  `false`.

### Returns

A Promise that resolves to the Google Cloud Storage URI of the uploaded file
(e.g., `"gs://your-bucket-name/your-file-path.txt"`).

### Examples

```ts
// Upload a file using environment variables for project and bucket.
// Assuming `BUCKET_PROJECT` and `BUCKET_NAME` are set in your environment.
const uri = await toBucket("./local/file.txt", "remote/file.txt");
console.log(uri); // "gs://my-bucket/remote/file.txt"
```

```ts
// Skip upload if the file already exists in the bucket.
const uriSkip = await toBucket("./local/file.txt", "remote/file.txt", {
  skip: true,
});
console.log(uriSkip); // Returns URI whether file was uploaded or already existed
```

```ts
// If the local file doesn't exist but the remote file does, the URI is returned without error.
// (Assuming "./non-existent.txt" does not exist locally, but "remote/file.txt" exists in the bucket)
const uriNonExistentLocal = await toBucket(
  "./non-existent.txt",
  "remote/file.txt",
  {
    skip: true,
  },
);
console.log(uriNonExistentLocal); // "gs://my-bucket/remote/file.txt"
```

```ts
// Overwrite an existing file in the bucket.
const uriOverwrite = await toBucket("./local/file.txt", "remote/file.txt", {
  overwrite: true,
});
console.log(uriOverwrite); // "gs://my-bucket/remote/file.txt"
```

```ts
// Upload a file with specified project, bucket, and custom metadata.
const uriExplicit = await toBucket("./local/file.txt", "remote/file.txt", {
  project: "my-gcp-project",
  bucket: "my-bucket-name",
  metadata: {
    contentType: "text/plain",
    cacheControl: "public, max-age=3600",
  },
});
console.log(uriExplicit);
```
