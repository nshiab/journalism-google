/**
 * @module
 *
 * The Journalism library (Google services functions)
 *
 * To install the library with Deno, use:
 * ```bash
 * deno add jsr:@nshiab/journalism-google
 * ```
 *
 * To install the library with Node.js, use:
 * ```bash
 * npm i @nshiab/journalism-google
 * ```
 *
 * To import a function, use:
 * ```ts
 * import { functionName } from "@nshiab/journalism-google";
 * ```
 */

import addSheetRows from "./google/addSheetRows.ts";
import overwriteSheetData from "./google/overwriteSheetData.ts";
import getSheetData from "./google/getSheetData.ts";
import toBucket from "./google/toBucket.ts";
import deleteFromBucket from "./google/deleteFromBucket.ts";
import inBucket from "./google/inBucket.ts";
import downloadFromBucket from "./google/downloadFromBucket.ts";
import filesInBucket from "./google/filesInBucket.ts";
import pushToSheet from "./google/pushToSheet.ts";

export {
  addSheetRows,
  deleteFromBucket,
  downloadFromBucket,
  filesInBucket,
  getSheetData,
  inBucket,
  overwriteSheetData,
  pushToSheet,
  toBucket,
};
