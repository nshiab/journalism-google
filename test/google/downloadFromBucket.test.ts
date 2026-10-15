import deleteFromBucket from "../../src/google/deleteFromBucket.ts";
import { test, expect, describe, beforeEach, afterAll } from "vite-plus/test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import toBucket from "../../src/google/toBucket.ts";
import downloadFromBucket from "../../src/google/downloadFromBucket.ts";
const remotePrefix = `journalism-tests/downloadFromBucket-${crypto.randomUUID()}`;
const testDataFile = "test/data/data.json";
const testDestination = `${remotePrefix}/test-file.json`;
let localDirectory = "";
let localDestination = "";
describe.skipIf(
  process.env.CI === "true" || !process.env.BUCKET_PROJECT || !process.env.BUCKET_NAME,
)("live Google integration", () => {
  beforeEach(async () => {
    if (localDirectory) rmSync(localDirectory, { recursive: true, force: true });
    localDirectory = mkdtempSync(join(tmpdir(), "journalism-google-download-"));
    localDestination = join(localDirectory, "data.json");
    await toBucket("test/data/data.json", testDestination, { overwrite: true });
  });
  afterAll(async () => {
    if (localDirectory) rmSync(localDirectory, { recursive: true, force: true });
    await deleteFromBucket(testDestination, { try: true });
  });

  test("should download a file from a bucket", async () => {
    await toBucket(testDataFile, testDestination, { overwrite: true });
    if (existsSync(localDestination)) {
      rmSync(localDestination);
    }
    await downloadFromBucket(testDestination, localDestination);
    expect(existsSync(localDestination)).toEqual(true);
  });
  test("should throw error when file exists and no options are set", async () => {
    await toBucket(testDataFile, testDestination, { overwrite: true });
    if (!existsSync(localDestination)) {
      await downloadFromBucket(testDestination, localDestination);
    }
    await expect(downloadFromBucket(testDestination, localDestination)).rejects.toThrow(
      "Local file",
    );
  });
  test("should skip download when file exists and skip option is true", async () => {
    if (!existsSync(localDestination)) {
      await downloadFromBucket(testDestination, localDestination);
    }
    await downloadFromBucket(testDestination, localDestination, { skip: true });
    expect(existsSync(localDestination)).toEqual(true);
  });
  test("should overwrite file when exists and overwrite option is true", async () => {
    if (!existsSync(localDestination)) {
      await downloadFromBucket(testDestination, localDestination);
    }
    await downloadFromBucket(testDestination, localDestination, {
      overwrite: true,
    });
    expect(existsSync(localDestination)).toEqual(true);
  });
  test("should throw error when both skip and overwrite options are true", async () => {
    await expect(
      downloadFromBucket(testDestination, localDestination, {
        skip: true,
        overwrite: true,
      }),
    ).rejects.toThrow("Cannot use both 'skip' and 'overwrite' options");
  });
});
