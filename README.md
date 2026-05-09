# BibleHub Auto Linker

BibleHub Auto Linker is an Obsidian community plugin that converts Bible references into external Markdown links to BibleHub.

Examples:

```md
John 3:16 -> [John 3:16](https://biblehub.com/john/3-16.htm)
Romans 8:1 -> [Romans 8:1](https://biblehub.com/romans/8-1.htm)
1 Corinthians 13:4-7 -> [1 Corinthians 13:4-7](https://biblehub.com/1_corinthians/13-4.htm)
1 Cor 13:4 -> [1 Cor 13:4](https://biblehub.com/1_corinthians/13-4.htm)
```

## Features

- Automatically links Bible references as you type after a natural delimiter.
- Converts the current note with the command `Convert Bible references in current note`.
- Converts only selected text with the command `Convert selected Bible references`.
- Supports all 66 Protestant Bible books.
- Supports common abbreviations such as `Jn`, `Rom`, `1 Cor`, `1 Thess`, and `Rev`.
- Preserves the visible text exactly as typed.
- Links verse ranges to the first verse on BibleHub.
- Skips existing Markdown links, inline code, fenced code blocks, and URLs.

## Settings

- `enableAutoLink`: turn live editor conversion on or off.
- `linkProvider`: currently fixed to `BibleHub`.
- `openInNewPane`: placeholder for future behavior.
- `convertRangesToFirstVerseUrl`: keeps BibleHub range links pointed at the first verse.
- `enabledBooks`: comma-separated canonical book names to recognize.
- `enableAbbreviations`: recognize common Bible book abbreviations.
- `requireTriggerAfterReference`: wait for a natural delimiter before live auto-linking.

## Build

```bash
npm install
npm run build
```

The production bundle is written to `main.js`.

## Test

```bash
npm test
```

## Manual Installation

1. Build the plugin:

```bash
npm install
npm run build
```

2. Create this folder inside your Obsidian vault:

```text
.obsidian/plugins/biblehub-auto-linker/
```

3. Copy these files into that folder:

```text
main.js
manifest.json
README.md
```

4. In Obsidian, open `Settings -> Community plugins`.
5. Turn off `Restricted mode` if needed.
6. Enable `BibleHub Auto Linker`.

## Development Layout

```text
manifest.json
package.json
tsconfig.json
esbuild.config.mjs
src/main.ts
src/linker.ts
tests/linker.test.ts
README.md
```
