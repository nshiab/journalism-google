import deleteFromBucket from "../../src/google/deleteFromBucket.ts";
import { test, expect, describe, beforeEach, afterAll } from "vite-plus/test";
import inBucket from "../../src/google/inBucket.ts";
import toBucket from "../../src/google/toBucket.ts";
const remotePrefix = `journalism-tests/inBucket-${crypto.randomUUID()}`;
describe.skipIf(
  process.env.CI === "true" ||
    !process.env.BUCKET_PROJECT ||
    !process.env.BUCKET_NAME ||
    !process.env.GOOGLE_APPLICATION_CREDENTIALS,
)("live Google integration", () => {
  beforeEach(async () => {
    await toBucket("test/data/data.json", `${remotePrefix}/data.json`, { overwrite: true });
  });
  afterAll(async () => {
    await deleteFromBucket(`${remotePrefix}/data.json`, { try: true });
  });

  test("inBucket returns true for an uploaded file", async () => {
    await toBucket("test/data/data.json", `${remotePrefix}/data.json`, { skip: true });
    const exists = await inBucket(`${remotePrefix}/data.json`);
    expect(exists).toEqual(true);
  });
  test("inBucket returns false for a non-existent file", async () => {
    const exists = await inBucket(`${remotePrefix}/this-file-should-not-exist.json`);
    expect(exists).toEqual(false);
  });
});
