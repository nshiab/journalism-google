import deleteFromBucket from "../../src/google/deleteFromBucket.ts";
import { test, expect, describe, beforeEach, afterAll } from "vite-plus/test";
import toBucket from "../../src/google/toBucket.ts";
import filesInBucket from "../../src/google/filesInBucket.ts";
const remotePrefix = `journalism-tests/filesInBucket-${crypto.randomUUID()}`;
describe.skipIf(
  process.env.CI === "true" || !process.env.BUCKET_PROJECT || !process.env.BUCKET_NAME,
)("live Google integration", () => {
  beforeEach(async () => {
    await toBucket("test/data/data.json", `${remotePrefix}/list-test/data.json`, {
      overwrite: true,
    });
  });
  afterAll(async () => {
    await deleteFromBucket(`${remotePrefix}/list-test/data.json`, { try: true });
  });

  test("filesInBucket lists uploaded files in a folder", async () => {
    await toBucket("test/data/data.json", `${remotePrefix}/list-test/data.json`, {
      overwrite: true,
    });
    const files = await filesInBucket({
      folder: `${remotePrefix}/list-test/`,
    });
    expect(files).toEqual(expect.arrayContaining([`${remotePrefix}/list-test/data.json`]));
  });
  // This read-only check requires the existing 100,000-object fixture.
  test("filesInBucket lists uploaded files in a folder and takes care of pagination", async () => {
    const files = await filesInBucket({
      folder: "journalism-tests/test-many-files/",
    });
    expect(files.length).toEqual(100000);
  });
  test("filesInBucket lists all files in the bucket", async () => {
    const files = await filesInBucket();
    if (files.length === 0) throw new Error("No files found in bucket");
  });
  test("filesInBucket returns Google Storage URIs when URI is true", async () => {
    const uris = await filesInBucket({
      folder: `${remotePrefix}/list-test/`,
      URI: true,
    });
    expect(uris).toEqual([`gs://${process.env.BUCKET_NAME}/${remotePrefix}/list-test/data.json`]);
  });
});
