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
