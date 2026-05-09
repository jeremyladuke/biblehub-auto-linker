export interface BibleHubAutoLinkerSettings {
  enableAutoLink: boolean;
  linkProvider: "BibleHub";
  openInNewPane: boolean;
  convertRangesToFirstVerseUrl: boolean;
  enabledBooks: string[];
  enableAbbreviations: boolean;
  requireTriggerAfterReference: boolean;
}

interface BookDefinition {
  canonical: string;
  slug: string;
  aliases: string[];
}

interface ProtectedRange {
  from: number;
  to: number;
}

interface ReferenceMatch {
  from: number;
  to: number;
  text: string;
  canonical: string;
  chapter: number;
  firstVerse: number;
}

export interface TrailingReferenceConversion {
  from: number;
  to: number;
  replacement: string;
}

export const BOOKS: BookDefinition[] = [
  { canonical: "Genesis", slug: "genesis", aliases: ["Gen"] },
  { canonical: "Exodus", slug: "exodus", aliases: ["Exod", "Ex"] },
  { canonical: "Leviticus", slug: "leviticus", aliases: ["Lev"] },
  { canonical: "Numbers", slug: "numbers", aliases: ["Num"] },
  { canonical: "Deuteronomy", slug: "deuteronomy", aliases: ["Deut"] },
  { canonical: "Joshua", slug: "joshua", aliases: ["Josh"] },
  { canonical: "Judges", slug: "judges", aliases: ["Judg"] },
  { canonical: "Ruth", slug: "ruth", aliases: [] },
  { canonical: "1 Samuel", slug: "1_samuel", aliases: ["1 Sam"] },
  { canonical: "2 Samuel", slug: "2_samuel", aliases: ["2 Sam"] },
  { canonical: "1 Kings", slug: "1_kings", aliases: [] },
  { canonical: "2 Kings", slug: "2_kings", aliases: [] },
  { canonical: "1 Chronicles", slug: "1_chronicles", aliases: ["1 Chron"] },
  { canonical: "2 Chronicles", slug: "2_chronicles", aliases: ["2 Chron"] },
  { canonical: "Ezra", slug: "ezra", aliases: [] },
  { canonical: "Nehemiah", slug: "nehemiah", aliases: ["Neh"] },
  { canonical: "Esther", slug: "esther", aliases: ["Esth"] },
  { canonical: "Job", slug: "job", aliases: [] },
  { canonical: "Psalms", slug: "psalms", aliases: ["Psalm", "Ps", "Psa"] },
  { canonical: "Proverbs", slug: "proverbs", aliases: ["Prov"] },
  { canonical: "Ecclesiastes", slug: "ecclesiastes", aliases: ["Eccl"] },
  { canonical: "Song of Solomon", slug: "songs", aliases: ["Song", "Song of Songs"] },
  { canonical: "Isaiah", slug: "isaiah", aliases: ["Isa"] },
  { canonical: "Jeremiah", slug: "jeremiah", aliases: ["Jer"] },
  { canonical: "Lamentations", slug: "lamentations", aliases: ["Lam"] },
  { canonical: "Ezekiel", slug: "ezekiel", aliases: ["Ezek"] },
  { canonical: "Daniel", slug: "daniel", aliases: ["Dan"] },
  { canonical: "Hosea", slug: "hosea", aliases: ["Hos"] },
  { canonical: "Joel", slug: "joel", aliases: [] },
  { canonical: "Amos", slug: "amos", aliases: [] },
  { canonical: "Obadiah", slug: "obadiah", aliases: ["Obad"] },
  { canonical: "Jonah", slug: "jonah", aliases: [] },
  { canonical: "Micah", slug: "micah", aliases: ["Mic"] },
  { canonical: "Nahum", slug: "nahum", aliases: ["Nah"] },
  { canonical: "Habakkuk", slug: "habakkuk", aliases: ["Hab"] },
  { canonical: "Zephaniah", slug: "zephaniah", aliases: ["Zeph"] },
  { canonical: "Haggai", slug: "haggai", aliases: ["Hag"] },
  { canonical: "Zechariah", slug: "zechariah", aliases: ["Zech"] },
  { canonical: "Malachi", slug: "malachi", aliases: ["Mal"] },
  { canonical: "Matthew", slug: "matthew", aliases: ["Matt", "Mt"] },
  { canonical: "Mark", slug: "mark", aliases: ["Mk"] },
  { canonical: "Luke", slug: "luke", aliases: ["Lk"] },
  { canonical: "John", slug: "john", aliases: ["Jn"] },
  { canonical: "Acts", slug: "acts", aliases: [] },
  { canonical: "Romans", slug: "romans", aliases: ["Rom"] },
  { canonical: "1 Corinthians", slug: "1_corinthians", aliases: ["1 Cor"] },
  { canonical: "2 Corinthians", slug: "2_corinthians", aliases: ["2 Cor"] },
  { canonical: "Galatians", slug: "galatians", aliases: ["Gal"] },
  { canonical: "Ephesians", slug: "ephesians", aliases: ["Eph"] },
  { canonical: "Philippians", slug: "philippians", aliases: ["Phil"] },
  { canonical: "Colossians", slug: "colossians", aliases: ["Col"] },
  { canonical: "1 Thessalonians", slug: "1_thessalonians", aliases: ["1 Thess"] },
  { canonical: "2 Thessalonians", slug: "2_thessalonians", aliases: ["2 Thess"] },
  { canonical: "1 Timothy", slug: "1_timothy", aliases: ["1 Tim"] },
  { canonical: "2 Timothy", slug: "2_timothy", aliases: ["2 Tim"] },
  { canonical: "Titus", slug: "titus", aliases: [] },
  { canonical: "Philemon", slug: "philemon", aliases: ["Philem"] },
  { canonical: "Hebrews", slug: "hebrews", aliases: ["Heb"] },
  { canonical: "James", slug: "james", aliases: ["Jas"] },
  { canonical: "1 Peter", slug: "1_peter", aliases: ["1 Pet"] },
  { canonical: "2 Peter", slug: "2_peter", aliases: ["2 Pet"] },
  { canonical: "1 John", slug: "1_john", aliases: [] },
  { canonical: "2 John", slug: "2_john", aliases: [] },
  { canonical: "3 John", slug: "3_john", aliases: [] },
  { canonical: "Jude", slug: "jude", aliases: [] },
  { canonical: "Revelation", slug: "revelation", aliases: ["Rev"] }
];

export const DEFAULT_SETTINGS: BibleHubAutoLinkerSettings = {
  enableAutoLink: true,
  linkProvider: "BibleHub",
  openInNewPane: false,
  convertRangesToFirstVerseUrl: true,
  enabledBooks: BOOKS.map((book) => book.canonical),
  enableAbbreviations: true,
  requireTriggerAfterReference: true
};

const NATURAL_DELIMITERS = new Set([" ", "\n", "\t", ".", ",", ";", ":", ")", "]", "}", "!", "?"]);

export function buildBibleHubUrl(bookName: string, chapter: number, firstVerse: number): string {
  const book = findBookByCanonical(bookName);
  if (!book) {
    throw new Error(`Unsupported Bible book: ${bookName}`);
  }
  return `https://biblehub.com/${book.slug}/${chapter}-${firstVerse}.htm`;
}

export function convertBibleReferences(text: string, settings: BibleHubAutoLinkerSettings): string {
  const matcher = createReferenceRegex(settings);
  const protectedRanges = collectProtectedRanges(text);
  let result = "";
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const reference = parseReferenceMatch(match, settings);
    if (!reference || isProtected(reference.from, reference.to, protectedRanges)) {
      continue;
    }

    result += text.slice(lastIndex, reference.from);
    result += createMarkdownLink(reference, settings);
    lastIndex = reference.to;
  }

  return result + text.slice(lastIndex);
}

export function convertPastedText(text: string, settings: BibleHubAutoLinkerSettings): string {
  if (!settings.enableAutoLink) {
    return text;
  }

  return convertBibleReferences(text, settings);
}

export function convertReferenceAtOffset(
  text: string,
  offset: number,
  settings: BibleHubAutoLinkerSettings
): TrailingReferenceConversion | null {
  const matcher = createReferenceRegex(settings);
  const protectedRanges = collectProtectedRanges(text);

  for (const match of text.matchAll(matcher)) {
    const reference = parseReferenceMatch(match, settings);
    if (
      reference &&
      offset >= reference.from &&
      offset <= reference.to &&
      !isProtected(reference.from, reference.to, protectedRanges)
    ) {
      return {
        from: reference.from,
        to: reference.to,
        replacement: createMarkdownLink(reference, settings)
      };
    }
  }

  return null;
}

export function isRangeProtectedInMarkdown(text: string, from: number, to: number): boolean {
  return isProtected(from, to, collectProtectedRanges(text));
}

export function convertTrailingReference(
  textBeforeCursor: string,
  settings: BibleHubAutoLinkerSettings
): TrailingReferenceConversion | null {
  if (!settings.enableAutoLink || textBeforeCursor.length === 0) {
    return null;
  }

  const delimiter = textBeforeCursor[textBeforeCursor.length - 1];
  if (settings.requireTriggerAfterReference && !NATURAL_DELIMITERS.has(delimiter)) {
    return null;
  }

  const searchText = settings.requireTriggerAfterReference ? textBeforeCursor.slice(0, -1) : textBeforeCursor;
  const matcher = createReferenceRegex(settings);
  const protectedRanges = collectProtectedRanges(textBeforeCursor);
  let trailing: ReferenceMatch | null = null;

  for (const match of searchText.matchAll(matcher)) {
    const reference = parseReferenceMatch(match, settings);
    if (reference && reference.to === searchText.length) {
      trailing = reference;
    }
  }

  if (!trailing || isProtected(trailing.from, trailing.to, protectedRanges)) {
    return null;
  }

  return {
    from: trailing.from,
    to: trailing.to,
    replacement: createMarkdownLink(trailing, settings)
  };
}

function createMarkdownLink(reference: ReferenceMatch, settings: BibleHubAutoLinkerSettings): string {
  return `[${reference.text}](${buildBibleHubUrl(reference.canonical, reference.chapter, reference.firstVerse)})`;
}

function parseReferenceMatch(
  match: RegExpMatchArray,
  settings: BibleHubAutoLinkerSettings
): ReferenceMatch | null {
  const fullMatch = match[0];
  const prefix = match[1] ?? "";
  const bookText = match[2];
  const chapterText = match[3];
  const verseText = match[4];
  const from = (match.index ?? 0) + prefix.length;
  const to = (match.index ?? 0) + fullMatch.length;
  const book = findBookByAlias(bookText, settings);

  if (!book || !settings.enabledBooks.includes(book.canonical)) {
    return null;
  }

  return {
    from,
    to,
    text: fullMatch.slice(prefix.length),
    canonical: book.canonical,
    chapter: Number.parseInt(chapterText, 10),
    firstVerse: Number.parseInt(verseText, 10)
  };
}

function createReferenceRegex(settings: BibleHubAutoLinkerSettings): RegExp {
  const aliases = BOOKS.flatMap((book) => {
    const names = [book.canonical];
    if (settings.enableAbbreviations) {
      names.push(...book.aliases);
    }
    return names;
  })
    .sort((a, b) => b.length - a.length)
    .map(aliasToPattern);

  return new RegExp(`(^|[^\\w/])(${aliases.join("|")})\\s+(\\d{1,3}):(\\d{1,3})(?:\\s*[-–—]\\s*\\d{1,3})?`, "gi");
}

function aliasToPattern(alias: string): string {
  return escapeRegex(alias).replace(/\\ /g, "\\s+");
}

function findBookByCanonical(canonical: string): BookDefinition | undefined {
  return BOOKS.find((book) => book.canonical.toLowerCase() === canonical.toLowerCase());
}

function findBookByAlias(alias: string, settings: BibleHubAutoLinkerSettings): BookDefinition | undefined {
  const normalized = normalizeAlias(alias);
  return BOOKS.find((book) => {
    if (normalizeAlias(book.canonical) === normalized) {
      return true;
    }
    return settings.enableAbbreviations && book.aliases.some((candidate) => normalizeAlias(candidate) === normalized);
  });
}

function normalizeAlias(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectProtectedRanges(text: string): ProtectedRange[] {
  const ranges: ProtectedRange[] = [];
  addRegexRanges(text, /```[\s\S]*?```/g, ranges);
  addRegexRanges(text, /`[^`\n]*`/g, ranges);
  addRegexRanges(text, /\[[^\]\n]*\]\([^) \n]+(?:\s+"[^"]*")?\)/g, ranges);
  addRegexRanges(text, /https?:\/\/[^\s<>)]+/g, ranges);
  addOpenCodeRanges(text, ranges);
  return mergeRanges(ranges);
}

function addOpenCodeRanges(text: string, ranges: ProtectedRange[]): void {
  const fenceMatches = Array.from(text.matchAll(/```/g));
  if (fenceMatches.length % 2 === 1) {
    const lastFence = fenceMatches[fenceMatches.length - 1];
    if (lastFence.index !== undefined) {
      ranges.push({ from: lastFence.index, to: text.length });
      return;
    }
  }

  const lastLineStart = text.lastIndexOf("\n") + 1;
  const lastLine = text.slice(lastLineStart);
  const backticks = Array.from(lastLine.matchAll(/`/g));
  if (backticks.length % 2 === 1) {
    const lastBacktick = backticks[backticks.length - 1];
    if (lastBacktick.index !== undefined) {
      ranges.push({ from: lastLineStart + lastBacktick.index, to: text.length });
    }
  }
}

function addRegexRanges(text: string, regex: RegExp, ranges: ProtectedRange[]): void {
  for (const match of text.matchAll(regex)) {
    if (match.index !== undefined) {
      ranges.push({ from: match.index, to: match.index + match[0].length });
    }
  }
}

function mergeRanges(ranges: ProtectedRange[]): ProtectedRange[] {
  return ranges
    .sort((a, b) => a.from - b.from)
    .reduce<ProtectedRange[]>((merged, range) => {
      const previous = merged[merged.length - 1];
      if (!previous || range.from > previous.to) {
        merged.push({ ...range });
      } else {
        previous.to = Math.max(previous.to, range.to);
      }
      return merged;
    }, []);
}

function isProtected(from: number, to: number, ranges: ProtectedRange[]): boolean {
  return ranges.some((range) => from < range.to && to > range.from);
}
