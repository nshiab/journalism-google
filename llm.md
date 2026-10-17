**Journalism Google v2.0.2**

***

# The Journalism Library (google)

Useful TypeScript functions for accessing Google Sheets and Cloud Storage in journalism projects.
Part of the [journalism library](https://github.com/nshiab/journalism).

The library is maintained by [Nael Shiab](https://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use this library and more, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript. You
> might also find
> [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) useful.

## Installation

```sh
npm install @nshiab/journalism-google
```

```ts
import { getSheetData } from "@nshiab/journalism-google";

const rows = await getSheetData(
  "https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit#gid=0",
);
console.log(rows);
```

Configure Google service-account credentials before accessing Google services;
see the function documentation for authentication options.

To start a data project with folders, configuration and documentation for AI
agents, run:

```sh
npx @nshiab/setup-data-project
```

## Documentation

- [Documentation](https://nshiab.github.io/journalism-google/)
- [llms.txt — Documentation index for AI agents](https://nshiab.github.io/journalism-google/llms.txt)
- [llm.md — Complete Markdown reference](https://nshiab.github.io/journalism-google/llm.md),
  for AI assistants or offline reading
- [npm package](https://www.npmjs.com/package/@nshiab/journalism-google)

See
[CONTRIBUTING.md](https://github.com/nshiab/journalism-google/blob/main/CONTRIBUTING.md)
for development commands.

## Google

### deleteFromBucket()

> **deleteFromBucket**(`destination`, `options?`): `Promise`\<`void`\>

Deletes a specified file from a Google Cloud Storage (GCS) bucket.

The function requires the Google Cloud project ID and the target bucket name. These can be provided either through environment variables (`BUCKET_PROJECT` and `BUCKET_NAME`) or directly as parameters in the `options` object. Parameters passed in `options` will take precedence over environment variables.

By default, if the specified file does not exist in the bucket, the function will throw an error. However, you can suppress this behavior by setting the `try` option to `true`, which will cause the function to complete silently if the file is not found.

#### Parameters

##### destination

`string`

The full path to the file within the bucket (e.g., 'my-folder/my-file.txt').

##### options?

Optional configuration for the deletion operation.

###### bucket?

`string`

The name of the Google Cloud Storage bucket. If not provided, it defaults to the `BUCKET_NAME` environment variable.

###### project?

`string`

The Google Cloud project ID. If not provided, it defaults to the `BUCKET_PROJECT` environment variable.

###### try?

`boolean`

If `true`, the function will not throw an error if the file to be deleted does not exist. Defaults to `false`.

#### Returns

`Promise`\<`void`\>

#### Examples

```ts
import { deleteFromBucket } from "@nshiab/journalism-google";

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
  bucket: "my-data-bucket"
});
```

***

### downloadFromBucket()

> **downloadFromBucket**(`source`, `destination`, `options?`): `Promise`\<`void`\>

Downloads a file from a Google Cloud Storage (GCS) bucket to a specified local path. This function provides robust handling for existing local files, allowing you to skip downloads or overwrite files as needed.

The function requires the Google Cloud project ID and the target bucket name. These can be provided either through environment variables (`BUCKET_PROJECT` and `BUCKET_NAME`) or directly as parameters in the `options` object. Parameters passed in `options` will take precedence over environment variables.

By default, if a local file with the same name already exists at the `destination` path, the function will throw an error to prevent accidental overwrites. You can modify this behavior using the `skip` or `overwrite` options.

#### Parameters

##### source

`string`

The path to the file within the GCS bucket (e.g., 'my-folder/document.pdf').

##### destination

`string`

The local file path where the downloaded file will be saved (e.g., './downloads/document.pdf').

##### options?

Optional configuration for the download operation.

###### bucket?

`string`

The name of the Google Cloud Storage bucket. If not provided, it defaults to the `BUCKET_NAME` environment variable.

###### overwrite?

`boolean`

If `true`, an existing local file at the `destination` path will be overwritten. Cannot be used with `skip`. Defaults to `false`.

###### project?

`string`

The Google Cloud project ID. If not provided, it defaults to the `BUCKET_PROJECT` environment variable.

###### skip?

`boolean`

If `true`, the download will be skipped if a local file already exists at the `destination` path. Cannot be used with `overwrite`. Defaults to `false`.

#### Returns

`Promise`\<`void`\>

#### Examples

```ts
import { downloadFromBucket } from "@nshiab/journalism-google";

// Basic usage: Download a file.
await downloadFromBucket("reports/annual-report.pdf", "./local-reports/annual-report.pdf");
console.log("File downloaded successfully!");
```

```ts
// Skip download if the file already exists locally.
await downloadFromBucket("images/profile.jpg", "./local-images/profile.jpg", { skip: true });
console.log("Download skipped if file exists, or downloaded otherwise.");
```

```ts
// Overwrite an existing local file.
await downloadFromBucket("data/latest-data.csv", "./local-data/latest-data.csv", { overwrite: true });
console.log("File downloaded and overwritten if it existed.");
```

```ts
// Specify project and bucket explicitly.
await downloadFromBucket("configs/app-settings.json", "./local-configs/settings.json", {
  project: "my-gcp-project",
  bucket: "my-config-bucket"
});
```

***

### filesInBucket()

> **filesInBucket**(`options?`): `Promise`\<`string`[]\>

Lists files within a Google Cloud Storage (GCS) bucket. You can list all files in the bucket or narrow down the results to a specific folder. The function can also return the full Google Storage URIs for each file.

This function requires the Google Cloud project ID and the target bucket name. These can be provided either through environment variables (`BUCKET_PROJECT` and `BUCKET_NAME`) or directly as parameters in the `options` object. Parameters passed in `options` will take precedence over environment variables.

#### Parameters

##### options?

Optional configuration for listing files.

###### bucket?

`string`

The name of the Google Cloud Storage bucket. If not provided, it defaults to the `BUCKET_NAME` environment variable.

###### folder?

`string`

The path to a specific folder within the bucket (e.g., 'my-data/'). Only files within this folder will be listed.

###### project?

`string`

The Google Cloud project ID. If not provided, it defaults to the `BUCKET_PROJECT` environment variable.

###### URI?

`boolean`

If `true`, the function will return the full Google Storage URI (e.g., 'gs://your-bucket/path/to/file.txt') for each file. Defaults to `false`, returning just the file path within the bucket.

#### Returns

`Promise`\<`string`[]\>

An array of strings, where each string is either the file path within the bucket or its full Google Storage URI, depending on the `URI` option.

#### Examples

```ts
import { filesInBucket } from "@nshiab/journalism-google";

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
  folder: "old-data/"
});
console.log("Files from specific bucket:", specificBucketFiles);
```

***

### getSheetData()

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables (`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the service account email). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed instructions on setting up credentials, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

#### Examples

```ts
import { getSheetData } from "@nshiab/journalism-google";

// Fake URL used as an example.
const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

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
  apiKey: "GG_KEY"
});
console.log(dataWithCustomCredentials);
```

#### Param

**sheetUrl**

The URL of the Google Sheet from which to retrieve data. This URL should point to a specific sheet (e.g., ending with `#gid=0`).

#### Param

**options**

An optional object with configuration options:

#### Param

**options.skip**

The number of rows to skip from the beginning of the sheet before parsing the data. This is useful for sheets that have metadata at the top. Defaults to `0`.

#### Param

**options.csv**

If `true`, the function will return the raw data as a CSV string. If `false` or omitted, it will return an array of objects, where each object represents a row and keys correspond to column headers. Defaults to `false`.

#### Param

**options.apiEmail**

Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

#### Param

**options.apiKey**

Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.

#### Call Signature

> **getSheetData**(`sheetUrl`, `options`): `Promise`\<`string`\>

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables (`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the service account email). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed instructions on setting up credentials, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

##### Parameters

###### sheetUrl

`string`

The URL of the Google Sheet from which to retrieve data. This URL should point to a specific sheet (e.g., ending with `#gid=0`).

###### options

An optional object with configuration options:

###### apiEmail?

`string`

Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

###### apiKey?

`string`

Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.

###### csv

`true`

If `true`, the function will return the raw data as a CSV string. If `false` or omitted, it will return an array of objects, where each object represents a row and keys correspond to column headers. Defaults to `false`.

###### skip?

`number`

The number of rows to skip from the beginning of the sheet before parsing the data. This is useful for sheets that have metadata at the top. Defaults to `0`.

##### Returns

`Promise`\<`string`\>

A Promise that resolves to either an array of objects (`Record<string, string>[]`) if `options.csv` is `false`, or a CSV string (`string`) if `options.csv` is `true`.

##### Examples

```ts
import { getSheetData } from "@nshiab/journalism-google";

// Fake URL used as an example.
const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

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
  apiKey: "GG_KEY"
});
console.log(dataWithCustomCredentials);
```

#### Call Signature

> **getSheetData**(`sheetUrl`, `options?`): `Promise`\<`Record`\<`string`, `string`\>[]\>

Retrieves data from a Google Sheet.

By default, this function attempts to authenticate using environment variables (`GOOGLE_PRIVATE_KEY` for the API key and `GOOGLE_SERVICE_ACCOUNT_EMAIL` for the service account email). Alternatively, you can use `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file. For detailed instructions on setting up credentials, refer to the `node-google-spreadsheet` authentication guide: [https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

##### Parameters

###### sheetUrl

`string`

The URL of the Google Sheet from which to retrieve data. This URL should point to a specific sheet (e.g., ending with `#gid=0`).

###### options?

An optional object with configuration options:

###### apiEmail?

`string`

Name of the environment variable containing the service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

###### apiKey?

`string`

Name of the environment variable containing the service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.

###### csv?

`false`

If `true`, the function will return the raw data as a CSV string. If `false` or omitted, it will return an array of objects, where each object represents a row and keys correspond to column headers. Defaults to `false`.

###### skip?

`number`

The number of rows to skip from the beginning of the sheet before parsing the data. This is useful for sheets that have metadata at the top. Defaults to `0`.

##### Returns

`Promise`\<`Record`\<`string`, `string`\>[]\>

A Promise that resolves to either an array of objects (`Record<string, string>[]`) if `options.csv` is `false`, or a CSV string (`string`) if `options.csv` is `true`.

##### Examples

```ts
import { getSheetData } from "@nshiab/journalism-google";

// Fake URL used as an example.
const sheetUrl = "https://docs.google.com/spreadsheets/d/nrqo3oP4KMWYbELScQa8W1nHZPfIrA7LIz9UmcRE4GyJN/edit#gid=0";

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
  apiKey: "GG_KEY"
});
console.log(dataWithCustomCredentials);
```

***

### inBucket()

> **inBucket**(`destination`, `options?`): `Promise`\<`boolean`\>

Checks if a specified file exists within a Google Cloud Storage (GCS) bucket. This function provides a straightforward way to verify the presence of a file in your GCS infrastructure, which is useful for conditional operations, data validation, or status checks.

Authentication and bucket identification can be configured either through environment variables (`BUCKET_PROJECT` for the Google Cloud Project ID and `BUCKET_NAME` for the bucket name) or by passing them directly as options to the function. Options provided directly will take precedence over environment variables.

#### Parameters

##### destination

`string`

The full path to the file within the bucket (e.g., 'my-folder/my-file.txt').

##### options?

Optional settings for configuring the GCS client.

###### bucket?

`string`

The name of the Google Cloud Storage bucket. If not provided, it defaults to the `BUCKET_NAME` environment variable.

###### project?

`string`

Your Google Cloud Project ID. If not provided, it defaults to the `BUCKET_PROJECT` environment variable.

#### Returns

`Promise`\<`boolean`\>

A Promise that resolves to `true` if the file exists in the bucket, and `false` otherwise.

#### Examples

```ts
import { inBucket } from "@nshiab/journalism-google";

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
 bucket: "my-bucket-name"
});
if (existsInSpecificBucket) {
  console.log("File exists in the specified bucket.");
} else {
  console.log("File does not exist in the specified bucket.");
}
```

***

### openSpreadsheet()

> **openSpreadsheet**(`spreadsheetUrl`, `options?`): `Promise`\<\{ `sheetId?`: `number`; `spreadsheet`: `GoogleSpreadsheet`; \}\>

Opens a Google spreadsheet and returns its loaded representation. When the
URL identifies a specific tab with a `gid`, that ID is also returned as
`sheetId`; otherwise, `sheetId` is undefined.

By default, authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
`GOOGLE_PRIVATE_KEY`. Alternatively, `GOOGLE_APPLICATION_CREDENTIALS` can
point to a service-account JSON file. Credentials passed through
`options.credentials` take precedence over both environment-based methods.
The service account must have access to the spreadsheet.

To learn what you can do with the returned `spreadsheet`, refer to the
`node-google-spreadsheet` documentation:
[https://theoephraim.github.io/node-google-spreadsheet/#/](https://theoephraim.github.io/node-google-spreadsheet/#/).

#### Parameters

##### spreadsheetUrl

`string`

A Google Sheets URL. It may identify a spreadsheet or
a specific tab.

##### options?

Controls authentication. The standard Google environment
variables are used when omitted.

###### apiEmail?

`string`

Name of the environment variable containing the
service-account email. Defaults to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

###### apiKey?

`string`

Name of the environment variable containing the
service-account private key. Defaults to `GOOGLE_PRIVATE_KEY`.

###### credentials?

\{ `email`: `string`; `privateKey`: `string`; \}

Explicit Google service-account credentials.

###### credentials.email

`string`

###### credentials.privateKey

`string`

#### Returns

`Promise`\<\{ `sheetId?`: `number`; `spreadsheet`: `GoogleSpreadsheet`; \}\>

The loaded spreadsheet and the tab ID found in the URL, if any.

#### Examples

**Open a spreadsheet using credentials from the environment.**

```ts
import { openSpreadsheet } from "@nshiab/journalism-google";

const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit";
const { spreadsheet } = await openSpreadsheet(spreadsheetUrl);
console.log(spreadsheet.title);
```

**Open a spreadsheet with explicit credentials.**

```ts
const { spreadsheet } = await openSpreadsheet(spreadsheetUrl, {
  credentials: {
    email: "service-account@project.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  },
});
```

**Access the tab selected by a URL containing a gid.**

```ts
const { spreadsheet, sheetId } = await openSpreadsheet(sheetUrl);
const sheet = sheetId === undefined
  ? spreadsheet.sheetsByIndex[0]
  : spreadsheet.sheetsById[sheetId];
```

***

### pushToSheet()

> **pushToSheet**(`data`, `sheetUrl`, `options?`): `Promise`\<`void`\>

Writes data to a Google Sheets tab, either replacing its contents or
appending rows. The tab can be selected by the URL's `gid` or by title.
If a titled tab does not exist, creation must be explicitly enabled with
`create: true`. In append mode, column headers are detected automatically
within the first 100 rows of the tab.

By default, authentication uses `GOOGLE_SERVICE_ACCOUNT_EMAIL` and
`GOOGLE_PRIVATE_KEY`. Alternatively, `GOOGLE_APPLICATION_CREDENTIALS` can
point to a service-account JSON file. Credentials passed through
`options.credentials` take precedence over both environment-based methods.
For detailed setup instructions, refer to the `node-google-spreadsheet`
authentication guide:
[https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).

#### Parameters

##### data

`object`[]

Rows of data. Object keys are used as column headers.

##### sheetUrl

`string`

A Google Sheets URL. It may identify a spreadsheet or a
specific tab.

##### options?

Controls tab selection, writing, metadata, value parsing, and
authentication.

###### create?

`boolean`

Creates a missing titled tab. Requires `tabTitle` and
defaults to `false`.

###### credentials?

\{ `email`: `string`; `privateKey`: `string`; \}

Explicit Google service-account credentials.
These values override `GOOGLE_APPLICATION_CREDENTIALS`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.

###### credentials.email

`string`

###### credentials.privateKey

`string`

###### lastUpdate?

`boolean` \| `"Canada/Atlantic"` \| `"Canada/Central"` \| `"Canada/Eastern"` \| `"Canada/Mountain"` \| `"Canada/Newfoundland"` \| `"Canada/Pacific"` \| `"Canada/Saskatchewan"` \| `"Canada/Yukon"`

Adds a UTC timestamp when `true`, or a timestamp in
the specified Canadian time zone. Available only in overwrite mode.

###### mode?

`"overwrite"` \| `"append"`

Whether to overwrite the tab or append rows. Defaults to
`"overwrite"`.

###### prepend?

`string`

Adds text above the header row in overwrite mode.

###### raw?

`boolean`

Writes values without Google Sheets interpretation.
Defaults to `true`.

###### tabTitle?

`string`

Selects a tab by title instead of using the URL's
`gid`.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the data has been written.

#### Examples

**Overwrite the tab selected by the URL.**

```ts
import { pushToSheet } from "@nshiab/journalism-google";

const data = [{ id: "001", name: "Alice" }];
const sheetUrl = "https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit#gid=0";
await pushToSheet(data, sheetUrl);
```

**Append rows to a tab selected by title.**

```ts
await pushToSheet(data, sheetUrl, {
  mode: "append",
  tabTitle: "Election results",
});
```

**Create a missing tab and write a timestamp in Eastern time.**

```ts
await pushToSheet(data, sheetUrl, {
  tabTitle: "Election results",
  create: true,
  lastUpdate: "Canada/Eastern",
});
```

***

### toBucket()

> **toBucket**(`file`, `destination`, `options?`): `Promise`\<`string`\>

Uploads a local file to a Google Cloud Storage (GCS) bucket and returns the URI of the uploaded file. This function provides robust control over the upload process, including options for skipping uploads if the file already exists, overwriting existing files, and setting custom metadata.

By default, if a file with the same destination path already exists in the bucket, an error will be thrown to prevent accidental overwrites. You can modify this behavior using the `skip` or `overwrite` options.

Authentication and bucket identification can be configured either through environment variables (`BUCKET_PROJECT` for the Google Cloud Project ID and `BUCKET_NAME` for the bucket name) or by passing them directly as options to the function. Options provided directly will take precedence over environment variables.

#### Parameters

##### file

`string`

The absolute or relative path to the local file that you want to upload.

##### destination

`string`

The desired path and filename for the file within the GCS bucket (e.g., `"my-folder/my-uploaded-file.txt"`).

##### options?

Optional settings to customize the upload behavior.

###### bucket?

`string`

The name of the Google Cloud Storage bucket. If not provided, it defaults to the `BUCKET_NAME` environment variable.

###### metadata?

\{\[`key`: `string`\]: `unknown`; \}

An object containing custom metadata to be associated with the uploaded file (e.g., `contentType`, `cacheControl`). This is passed directly to the GCS upload options.

###### overwrite?

`boolean`

If `true`, an existing file at the `destination` path in the bucket will be overwritten. Cannot be used with `skip: true`. Defaults to `false`.

###### project?

`string`

Your Google Cloud Project ID. If not provided, it defaults to the `BUCKET_PROJECT` environment variable.

###### skip?

`boolean`

If `true`, the upload will be skipped if a file with the same `destination` path already exists in the bucket. If the local file does not exist but the remote file does, the URI of the remote file will be returned without an error. Cannot be used with `overwrite: true`. Defaults to `false`.

#### Returns

`Promise`\<`string`\>

A Promise that resolves to the Google Cloud Storage URI of the uploaded file (e.g., `"gs://your-bucket-name/your-file-path.txt"`).

#### Examples

```ts
import { toBucket } from "@nshiab/journalism-google";

// Upload a file using environment variables for project and bucket.
// Assuming `BUCKET_PROJECT` and `BUCKET_NAME` are set in your environment.
const uri = await toBucket("./local/file.txt", "remote/file.txt");
console.log(uri); // "gs://my-bucket/remote/file.txt"
```

```ts
// Skip upload if the file already exists in the bucket.
const uriSkip = await toBucket("./local/file.txt", "remote/file.txt", {
  skip: true
});
console.log(uriSkip); // Returns URI whether file was uploaded or already existed
```

```ts
// If the local file doesn't exist but the remote file does, the URI is returned without error.
// (Assuming "./non-existent.txt" does not exist locally, but "remote/file.txt" exists in the bucket)
const uriNonExistentLocal = await toBucket("./non-existent.txt", "remote/file.txt", {
  skip: true
});
console.log(uriNonExistentLocal); // "gs://my-bucket/remote/file.txt"
```

```ts
// Overwrite an existing file in the bucket.
const uriOverwrite = await toBucket("./local/file.txt", "remote/file.txt", {
  overwrite: true
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
    cacheControl: "public, max-age=3600"
  }
});
console.log(uriExplicit);
```
