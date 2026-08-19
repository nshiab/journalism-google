import "@std/dotenv/load";
import {
  assertEquals,
  assertExists,
  assertMatch,
  assertRejects,
} from "jsr:@std/assert";
import getSheetData from "../../src/google/getSheetData.ts";
import { openSpreadsheet, pushToSheet } from "../../src/index.ts";

const data = [{ first: "Nael", last: "Shiab" }];
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/spreadsheet-id/edit#gid=0";

Deno.test("requires a tab title when creation is enabled", async () => {
  await assertRejects(
    () => pushToSheet(data, sheetUrl, { create: true }),
    Error,
    "create option requires tabTitle",
  );
});

Deno.test("rejects an invalid mode", async () => {
  await assertRejects(
    () =>
      pushToSheet(data, sheetUrl, {
        mode: "replace" as "overwrite",
      }),
    Error,
    'Expected "overwrite" or "append"',
  );
});

Deno.test("rejects an empty tab title", async () => {
  await assertRejects(
    () => pushToSheet(data, sheetUrl, { tabTitle: "  " }),
    Error,
    "tabTitle cannot be empty",
  );
});

Deno.test("rejects prepended text in append mode", async () => {
  await assertRejects(
    () =>
      pushToSheet(data, sheetUrl, {
        mode: "append",
        prepend: "Newsroom data",
      }),
    Error,
    "only available in overwrite mode",
  );
});

Deno.test("rejects a last-update timestamp in append mode", async () => {
  await assertRejects(
    () =>
      pushToSheet(data, sheetUrl, {
        mode: "append",
        lastUpdate: true,
      }),
    Error,
    "only available in overwrite mode",
  );
});

const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");

if (email && privateKey) {
  Deno.test(
    "overwrites and appends while discovering headers below metadata",
    { sanitizeResources: false },
    async () => {
      const integrationSheetUrl =
        "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit?gid=0#gid=0";
      const rawData = [{ id: "001", formula: "=1+1" }];

      await pushToSheet(rawData, integrationSheetUrl, {
        prepend: "Push to sheet integration test",
        lastUpdate: "Canada/Eastern",
      });
      await pushToSheet(
        [{ id: "002", formula: "+1+1" }],
        integrationSheetUrl,
        { mode: "append" },
      );

      assertEquals(
        await getSheetData(integrationSheetUrl, { skip: 2 }),
        [
          { id: "001", formula: "=1+1" },
          { id: "002", formula: "+1+1" },
        ],
      );
    },
  );

  Deno.test(
    "creates a missing titled tab",
    { sanitizeResources: false },
    async () => {
      const spreadsheetUrl =
        "https://docs.google.com/spreadsheets/d/1Ar19cP8oGYEzacfrkLWnSH7ZqImILMUrosBwnZ43EQM/edit";
      const credentials = { email, privateKey };
      const tabTitle = `pushToSheet-${crypto.randomUUID()}`;
      const { spreadsheet } = await openSpreadsheet(spreadsheetUrl, {
        credentials,
      });

      try {
        await assertRejects(
          () =>
            pushToSheet(data, spreadsheetUrl, {
              tabTitle,
              credentials,
            }),
          Error,
          `Tab titled "${tabTitle}" not found`,
        );

        await pushToSheet(data, spreadsheetUrl, {
          mode: "append",
          tabTitle,
          create: true,
          credentials,
        });
        await spreadsheet.loadInfo();
        const createdTab = spreadsheet.sheetsByTitle[tabTitle];
        assertExists(createdTab);
        await createdTab.loadHeaderRow();
        assertEquals(createdTab.headerValues, ["first", "last"]);

        await pushToSheet(
          [{ formula: "=1+1" }],
          `${spreadsheetUrl}?gid=0#gid=0`,
          {
            tabTitle,
            lastUpdate: true,
            raw: false,
            credentials,
          },
        );

        const csv = await getSheetData(
          `${spreadsheetUrl}#gid=${createdTab.sheetId}`,
          { csv: true },
        );
        assertMatch(csv, /^Last update:,.* UTC\r\nformula,\r\n2,$/);
      } finally {
        await spreadsheet.loadInfo();
        await spreadsheet.sheetsByTitle[tabTitle]?.delete();
      }
    },
  );
}
