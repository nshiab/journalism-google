import { test, expect, describe, beforeEach, afterAll } from "vite-plus/test";
import toBucket from "../../src/google/toBucket.ts";
import inBucket from "../../src/google/inBucket.ts";
import deleteFromBucket from "../../src/google/deleteFromBucket.ts";
const remotePrefix = `journalism-tests/deleteFromBucket-${crypto.randomUUID()}`;
const testDataFile = "test/data/data.json";
const testDestination = `${remotePrefix}/delete-test-file.json`;
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

  test("deleteFromBucket deletes a file from the bucket", async () => {
    await toBucket(testDataFile, testDestination, { skip: true });
    let exists = await inBucket(testDestination);
    expect(exists).toEqual(true);
    await deleteFromBucket(testDestination);
    exists = await inBucket(testDestination);
    expect(exists).toEqual(false);
  });
  test("deleteFromBucket throws error when file doesn't exist", async () => {
    const nonExistentFile = `${remotePrefix}/non-existent-file.json`;
    const exists = await inBucket(nonExistentFile);
    expect(exists).toEqual(false);
    await expect(deleteFromBucket(nonExistentFile)).rejects.toThrow(Error);
  });
  test("deleteFromBucket with try option doesn't throw when file doesn't exist", async () => {
    const nonExistentFile = `${remotePrefix}/try-delete-test.json`;
    const exists = await inBucket(nonExistentFile);
    expect(exists).toEqual(false);
    await deleteFromBucket(nonExistentFile, { try: true });
    const stillExists = await inBucket(nonExistentFile);
    expect(stillExists).toEqual(false);
  });
  test("deleteFromBucket with try option deletes existing file", async () => {
    await toBucket(testDataFile, testDestination, { overwrite: true });
    let exists = await inBucket(testDestination);
    expect(exists).toEqual(true);
    await deleteFromBucket(testDestination, { try: true });
    exists = await inBucket(testDestination);
    expect(exists).toEqual(false);
  });
});
