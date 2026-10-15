import { test, expect, describe, beforeEach, afterAll } from "vite-plus/test";
import toBucket from "../../src/google/toBucket.ts";
import inBucket from "../../src/google/inBucket.ts";
import deleteFromBucket from "../../src/google/deleteFromBucket.ts";
const remotePrefix = `journalism-tests/toBucket-${crypto.randomUUID()}`;
const testDataFile = "test/data/data.json";
const testDestination = `${remotePrefix}/test-file.json`;
describe.skipIf(
  process.env.CI === "true" ||
    !process.env.BUCKET_PROJECT ||
    !process.env.BUCKET_NAME ||
    !process.env.GOOGLE_APPLICATION_CREDENTIALS,
)("live Google integration", () => {
  beforeEach(async () => {
    await toBucket("test/data/data.json", testDestination, { overwrite: true });
  });
  afterAll(async () => {
    await deleteFromBucket(testDestination, { try: true });
  });

  test("should upload a file when it does not exist", async () => {
    const existsBefore = await inBucket(testDestination);
    if (existsBefore) {
      await deleteFromBucket(testDestination);
    }
    const result = await toBucket(testDataFile, testDestination);
    expect(typeof result).toEqual("string");
    expect(result?.startsWith("gs://")).toEqual(true);
    expect(result?.includes(testDestination)).toEqual(true);
    const existsAfter = await inBucket(testDestination);
    expect(existsAfter).toEqual(true);
  });
  test("should throw if file exists and overwrite is false", async () => {
    await expect(toBucket(testDataFile, testDestination)).rejects.toThrow("already exists");
  });
  test("should overwrite file when overwrite option is true", async () => {
    const result = await toBucket(testDataFile, testDestination, {
      overwrite: true,
    });
    expect(typeof result).toEqual("string");
    expect(result.startsWith("gs://")).toEqual(true);
    expect(result.includes(testDestination)).toEqual(true);
  });
  test("should skip upload when skip option is true and file exists", async () => {
    const result = await toBucket(testDataFile, testDestination, {
      skip: true,
    });
    expect(typeof result).toEqual("string");
    expect(result.startsWith("gs://")).toEqual(true);
    expect(result.includes(testDestination)).toEqual(true);
  });
  test("should upload when skip option is true but file does not exist", async () => {
    const existsBefore = await inBucket(testDestination);
    if (existsBefore) {
      await deleteFromBucket(testDestination);
    }
    const result = await toBucket(testDataFile, testDestination, {
      skip: true,
    });
    expect(typeof result).toEqual("string");
    expect(result.startsWith("gs://")).toEqual(true);
    expect(result.includes(testDestination)).toEqual(true);
    const existsAfter = await inBucket(testDestination);
    expect(existsAfter).toEqual(true);
  });
  test("should throw error when both skip and overwrite are true", async () => {
    await expect(
      toBucket(testDataFile, testDestination, { skip: true, overwrite: true }),
    ).rejects.toThrow("Cannot use both 'skip' and 'overwrite' options");
  });
  test("should return URI when skip is true, local file doesn't exist, but remote file exists", async () => {
    await toBucket(testDataFile, testDestination, { overwrite: true });
    const remoteExists = await inBucket(testDestination);
    expect(remoteExists).toEqual(true);
    const nonExistentFile = "test/data/non-existent-file.json";
    const result = await toBucket(nonExistentFile, testDestination, {
      skip: true,
    });
    expect(typeof result).toEqual("string");
    expect(result.startsWith("gs://")).toEqual(true);
    expect(result.includes(testDestination)).toEqual(true);
  });
  test("should throw error when skip is true and neither local nor remote file exists", async () => {
    const nonExistentDestination = `${remotePrefix}/definitely-non-existent-file.json`;
    const existsBefore = await inBucket(nonExistentDestination);
    if (existsBefore) {
      await deleteFromBucket(nonExistentDestination);
    }
    const nonExistentFile = "test/data/non-existent-file.json";
    await expect(toBucket(nonExistentFile, nonExistentDestination, { skip: true })).rejects.toThrow(
      "Local file",
    );
  });
});
