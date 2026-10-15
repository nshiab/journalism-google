import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const mocks = vi.hoisted(() => {
  const cells: Record<string, { value: string | number | null }> = {};
  const sheet = {
    rowCount: 1000,
    lastColumnLetter: "Z",
    clear: vi.fn(async () => {}),
    loadCells: vi.fn(async (_range: string) => {}),
    getCellByA1: vi.fn((address: string) => (cells[address] ??= { value: null })),
    saveUpdatedCells: vi.fn(async () => {}),
    setHeaderRow: vi.fn(async (_headers: string[], _index: number) => {}),
    loadHeaderRow: vi.fn(async (_index: number) => {}),
    addRows: vi.fn(async (_rows: unknown, _options: unknown) => []),
    getCellsInRange: vi.fn(async (_range: string): Promise<unknown> => [["id", "name"]]),
    downloadAsCSV: vi.fn(async () => Buffer.from('id,name\r\n001,"Émile, Montréal"')),
  };
  const sheetsById: Record<number, typeof sheet> = {};
  const sheetsByTitle: Record<string, typeof sheet> = {};
  const spreadsheet = {
    sheetsById,
    sheetsByTitle,
    loadInfo: vi.fn(async () => {}),
    addSheet: vi.fn(async (_options: { title: string }) => sheet),
  };
  const file = {
    exists: vi.fn(async () => [false]),
    delete: vi.fn(async () => {}),
    download: vi.fn(async (_options: unknown) => {}),
  };
  const bucket = {
    file: vi.fn((_name: string) => file),
    upload: vi.fn(async (_source: string, _options: unknown) => {}),
    getFiles: vi.fn(async (_options: unknown) => [
      [{ name: "data/a.json" }, { name: "data/b.json" }],
    ]),
  };
  return {
    sheet,
    spreadsheet,
    cells,
    file,
    bucket,
    auth: vi.fn((_options: unknown) => {}),
    open: vi.fn((_id: string, _auth: unknown) => {}),
    storage: vi.fn((_options: unknown) => {}),
    getBucket: vi.fn((_name: string) => bucket),
  };
});

vi.mock("google-auth-library", () => ({
  JWT: class {
    constructor(options: unknown) {
      mocks.auth(options);
    }
  },
}));
vi.mock("google-spreadsheet", () => ({
  GoogleSpreadsheet: class {
    constructor(id: string, auth: unknown) {
      mocks.open(id, auth);
    }
    sheetsById = mocks.spreadsheet.sheetsById;
    sheetsByTitle = mocks.spreadsheet.sheetsByTitle;
    loadInfo = mocks.spreadsheet.loadInfo;
    addSheet = mocks.spreadsheet.addSheet;
  },
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class {
    constructor(options: unknown) {
      mocks.storage(options);
    }
    bucket = mocks.getBucket;
  },
}));

import {
  deleteFromBucket,
  downloadFromBucket,
  filesInBucket,
  getSheetData,
  inBucket,
  openSpreadsheet,
  pushToSheet,
  toBucket,
} from "../../src/index.ts";
import clearSheet from "../../src/google/clearSheet.ts";

const sheetUrl = "https://docs.google.com/spreadsheets/d/fake-sheet/edit#gid=7";
let directory: string;
let localFile: string;
beforeEach(() => {
  vi.clearAllMocks();
  directory = mkdtempSync(join(tmpdir(), "journalism-google-mocks-"));
  localFile = join(directory, "data.json");
  writeFileSync(localFile, '{"message":"Émile"}');
  vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", "");
  vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", "fake@example.test");
  vi.stubEnv("GOOGLE_PRIVATE_KEY", "fake-private-key");
  vi.stubEnv("BUCKET_PROJECT", "fake-project");
  vi.stubEnv("BUCKET_NAME", "fake-bucket");
  mocks.spreadsheet.sheetsById = { 7: mocks.sheet };
  mocks.spreadsheet.sheetsByTitle = { Data: mocks.sheet };
  mocks.sheet.getCellsInRange.mockResolvedValue([["id", "name"]]);
  mocks.sheet.downloadAsCSV.mockResolvedValue(Buffer.from('id,name\r\n001,"Émile, Montréal"'));
  mocks.file.exists.mockResolvedValue([false]);
  for (const key of Object.keys(mocks.cells)) delete mocks.cells[key];
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  rmSync(directory, { recursive: true, force: true });
});

test("opens a spreadsheet using explicit credentials ahead of file and environment credentials", async () => {
  const path = join(directory, "credentials.json");
  writeFileSync(
    path,
    JSON.stringify({ client_email: "file@example.test", private_key: "file-key" }),
  );
  vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", path);
  const result = await openSpreadsheet(sheetUrl, {
    credentials: { email: "explicit@example.test", privateKey: "explicit-key" },
  });
  expect(result.sheetId).toBe(7);
  expect(mocks.auth).toHaveBeenCalledWith({
    email: "explicit@example.test",
    key: "explicit-key",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  expect(mocks.open).toHaveBeenCalledWith("fake-sheet", expect.anything());
  expect(mocks.spreadsheet.loadInfo).toHaveBeenCalledOnce();
});

test("prefers a credentials file and supports custom environment variable names", async () => {
  const path = join(directory, "credentials.json");
  writeFileSync(
    path,
    JSON.stringify({ client_email: "file@example.test", private_key: "file-key" }),
  );
  vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", path);
  await openSpreadsheet(sheetUrl);
  expect(mocks.auth).toHaveBeenLastCalledWith(
    expect.objectContaining({ email: "file@example.test", key: "file-key" }),
  );
  vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", join(directory, "missing.json"));
  vi.stubEnv("TEST_GOOGLE_EMAIL", "custom@example.test");
  vi.stubEnv("TEST_GOOGLE_KEY", "custom-key");
  await openSpreadsheet(sheetUrl, { apiEmail: "TEST_GOOGLE_EMAIL", apiKey: "TEST_GOOGLE_KEY" });
  expect(mocks.auth).toHaveBeenLastCalledWith(
    expect.objectContaining({ email: "custom@example.test", key: "custom-key" }),
  );
});

test.each([
  null,
  [],
  { client_email: 42, private_key: "key" },
  { client_email: "email", private_key: false },
])("rejects malformed service-account fields: %j", async (credentials) => {
  const path = join(directory, "credentials.json");
  writeFileSync(path, JSON.stringify(credentials));
  vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", path);
  await expect(openSpreadsheet(sheetUrl)).rejects.toThrow();
  expect(mocks.spreadsheet.loadInfo).not.toHaveBeenCalled();
});

test("propagates authentication and spreadsheet loading failures", async () => {
  mocks.spreadsheet.loadInfo.mockRejectedValueOnce(new Error("access denied"));
  await expect(openSpreadsheet(sheetUrl)).rejects.toThrow("access denied");
});

test("decodes UTF-8 CSV and preserves raw CSV, quoted values and skipped lines", async () => {
  expect(await getSheetData(sheetUrl)).toEqual([{ id: "001", name: "Émile, Montréal" }]);
  mocks.sheet.downloadAsCSV.mockResolvedValue(
    Buffer.from('Metadata,\r\nid,name\r\n001,"Émile, Montréal"'),
  );
  expect(await getSheetData(sheetUrl, { skip: 1, csv: true })).toBe(
    'id,name\r\n001,"Émile, Montréal"',
  );
  expect(await getSheetData(sheetUrl, { skip: 1 })).toEqual([
    { id: "001", name: "Émile, Montréal" },
  ]);
});

test("requires an existing selected tab when reading", async () => {
  await expect(getSheetData(sheetUrl.replace("#gid=7", ""))).rejects.toThrow("must include a gid");
  await expect(getSheetData(sheetUrl.replace("gid=7", "gid=8"))).rejects.toThrow("not found");
});

test("overwrites data with metadata, UTC timestamp and raw values by default", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-15T12:34:56Z"));
  await pushToSheet([{ id: "001", name: null }], sheetUrl, {
    prepend: "Newsroom",
    lastUpdate: true,
  });
  expect(mocks.sheet.clear).toHaveBeenCalledOnce();
  expect(mocks.cells).toEqual({
    A1: { value: "Newsroom" },
    A2: { value: "Last update:" },
    B2: { value: "2026-01-15 12:34:56 UTC" },
  });
  expect(mocks.sheet.setHeaderRow).toHaveBeenCalledWith(["id", "name"], 3);
  expect(mocks.sheet.addRows).toHaveBeenCalledWith([{ id: "001", name: "" }], { raw: true });
  expect(mocks.sheet.clear.mock.invocationCallOrder[0]).toBeLessThan(
    mocks.sheet.addRows.mock.invocationCallOrder[0],
  );
});

test("appends below discovered headers without clearing and respects raw false", async () => {
  mocks.sheet.getCellsInRange.mockResolvedValue([["Newsroom"], ["id", "name"], ["001", "Alice"]]);
  await pushToSheet([{ id: "002", name: "Bob" }], sheetUrl, { mode: "append", raw: false });
  expect(mocks.sheet.getCellsInRange).toHaveBeenCalledWith("A1:Z100");
  expect(mocks.sheet.loadHeaderRow).toHaveBeenCalledWith(2);
  expect(mocks.sheet.clear).not.toHaveBeenCalled();
  expect(mocks.sheet.addRows).toHaveBeenCalledWith([{ id: "002", name: "Bob" }], { raw: false });
});

test("initializes blank tabs and rejects missing or ambiguous headers", async () => {
  mocks.sheet.getCellsInRange.mockResolvedValue([[], [null, ""]]);
  await pushToSheet([{ id: "1" }], sheetUrl, { mode: "append" });
  expect(mocks.sheet.setHeaderRow).toHaveBeenCalledWith(["id"], 1);
  mocks.sheet.getCellsInRange.mockResolvedValue([["unrelated"]]);
  await expect(pushToSheet([{ id: "1" }], sheetUrl, { mode: "append" })).rejects.toThrow(
    "Could not find a header row",
  );
  mocks.sheet.getCellsInRange.mockResolvedValue([["id"], ["id"]]);
  await expect(pushToSheet([{ id: "1" }], sheetUrl, { mode: "append" })).rejects.toThrow(
    "Multiple possible header rows",
  );
  mocks.sheet.getCellsInRange.mockResolvedValue({ invalid: true });
  await expect(pushToSheet([{ id: "1" }], sheetUrl, { mode: "append" })).rejects.toThrow(
    "invalid cell range",
  );
});

test("selects titled tabs before gid and only creates absent tabs when requested", async () => {
  await pushToSheet([{ id: "1" }], sheetUrl.replace("gid=7", "gid=8"), { tabTitle: "Data" });
  expect(mocks.spreadsheet.addSheet).not.toHaveBeenCalled();
  await expect(pushToSheet([{ id: "1" }], sheetUrl, { tabTitle: "New" })).rejects.toThrow(
    'Tab titled "New" not found',
  );
  await pushToSheet([{ id: "1" }], sheetUrl, { tabTitle: "New", create: true });
  expect(mocks.spreadsheet.addSheet).toHaveBeenCalledWith({ title: "New" });
});

test("empty overwrite clears while empty append leaves rows unchanged", async () => {
  await pushToSheet([], sheetUrl);
  expect(mocks.sheet.clear).toHaveBeenCalledOnce();
  expect(mocks.sheet.addRows).not.toHaveBeenCalled();
  await pushToSheet([], sheetUrl, { mode: "append" });
  expect(mocks.sheet.clear).toHaveBeenCalledOnce();
  expect(mocks.sheet.getCellsInRange).not.toHaveBeenCalled();
  await expect(pushToSheet([{}], sheetUrl)).rejects.toThrow("at least one column");
});

test("clears a sheet", async () => {
  await clearSheet(sheetUrl);
  expect(mocks.sheet.clear).toHaveBeenCalledOnce();
});

test("passes project, bucket, upload path and metadata to storage", async () => {
  const metadata = { contentType: "application/json", metadata: { label: "Émile" } };
  expect(
    await toBucket(localFile, "reports/a.json", {
      project: "custom-project",
      bucket: "custom-bucket",
      metadata,
    }),
  ).toBe("gs://custom-bucket/reports/a.json");
  expect(mocks.storage).toHaveBeenCalledWith({ projectId: "custom-project" });
  expect(mocks.getBucket).toHaveBeenCalledWith("custom-bucket");
  expect(mocks.bucket.upload).toHaveBeenCalledWith(localFile, {
    destination: "reports/a.json",
    metadata,
  });
});

test("protects existing remote files and implements overwrite and skip", async () => {
  mocks.file.exists.mockResolvedValue([true]);
  await expect(toBucket(localFile, "a.json")).rejects.toThrow("already exists");
  expect(await toBucket(join(directory, "missing"), "a.json", { skip: true })).toBe(
    "gs://fake-bucket/a.json",
  );
  expect(mocks.bucket.upload).not.toHaveBeenCalled();
  await toBucket(localFile, "a.json", { overwrite: true });
  expect(mocks.bucket.upload).toHaveBeenCalledOnce();
  mocks.file.exists.mockResolvedValue([false]);
  await expect(toBucket(join(directory, "missing"), "a.json", { skip: true })).rejects.toThrow(
    "Local file",
  );
  await toBucket(localFile, "a.json", { skip: true });
  expect(mocks.bucket.upload).toHaveBeenCalledTimes(2);
  await expect(toBucket(localFile, "a.json", { skip: true, overwrite: true })).rejects.toThrow(
    "Cannot use both",
  );
});

test("protects local files during downloads and passes destination through", async () => {
  await expect(downloadFromBucket("a.json", localFile)).rejects.toThrow("already exists");
  await downloadFromBucket("a.json", localFile, { skip: true });
  expect(mocks.file.download).not.toHaveBeenCalled();
  await downloadFromBucket("a.json", localFile, { overwrite: true });
  expect(mocks.file.download).toHaveBeenCalledWith({ destination: localFile });
  await downloadFromBucket("a.json", join(directory, "new"));
  expect(mocks.file.download).toHaveBeenCalledTimes(2);
  await expect(
    downloadFromBucket("a.json", localFile, { skip: true, overwrite: true }),
  ).rejects.toThrow("Cannot use both");
});

test("lists all provider pages and constructs storage URIs", async () => {
  expect(await filesInBucket({ folder: "data/" })).toEqual(["data/a.json", "data/b.json"]);
  expect(mocks.bucket.getFiles).toHaveBeenCalledWith({ prefix: "data/", autoPaginate: true });
  expect(await filesInBucket({ URI: true })).toEqual([
    "gs://fake-bucket/data/a.json",
    "gs://fake-bucket/data/b.json",
  ]);
  expect(mocks.bucket.getFiles).toHaveBeenLastCalledWith({ prefix: undefined, autoPaginate: true });
});

test("reads remote existence and only suppresses missing-object deletion errors", async () => {
  expect(await inBucket("a.json")).toBe(false);
  mocks.file.exists.mockResolvedValue([true]);
  expect(await inBucket("a.json")).toBe(true);
  for (const message of ["404 missing", "No such object"]) {
    mocks.file.delete.mockRejectedValueOnce(new Error(message));
    await deleteFromBucket("a.json", { try: true });
  }
  mocks.file.delete.mockRejectedValueOnce(new Error("permission denied"));
  await expect(deleteFromBucket("a.json", { try: true })).rejects.toThrow("permission denied");
  mocks.file.delete.mockRejectedValueOnce(new Error("404 missing"));
  await expect(deleteFromBucket("a.json")).rejects.toThrow("404 missing");
});

test("requires bucket configuration before any provider call", async () => {
  vi.stubEnv("BUCKET_PROJECT", "");
  for (const operation of [
    () => toBucket(localFile, "a"),
    () => downloadFromBucket("a", localFile),
    () => filesInBucket(),
    () => inBucket("a"),
    () => deleteFromBucket("a"),
  ]) {
    await expect(operation()).rejects.toThrow("Project ID and bucket name");
  }
  expect(mocks.storage).not.toHaveBeenCalled();
});
