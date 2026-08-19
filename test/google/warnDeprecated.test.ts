import { assertEquals } from "jsr:@std/assert";
import warnDeprecated from "../../src/google/helpers/warnDeprecated.ts";

Deno.test("emits each deprecation warning only once", () => {
  const messages: string[] = [];
  const writeWarning = (message: string) => messages.push(message);
  const functionName = `oldFunction-${crypto.randomUUID()}`;

  warnDeprecated(functionName, "newFunction()", writeWarning);
  warnDeprecated(functionName, "newFunction()", writeWarning);

  assertEquals(messages, [
    `[journalism-google] ${functionName}() is deprecated. Use newFunction() instead. It may be removed in the next major release.`,
  ]);
});
