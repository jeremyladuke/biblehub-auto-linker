import { describe, expect, it } from "vitest";
import {
  buildBibleHubUrl,
  convertBibleReferences,
  convertPastedText,
  convertTrailingReference,
  DEFAULT_SETTINGS
} from "../src/linker";

describe("BibleHub URL generation", () => {
  it("builds simple reference URLs", () => {
    expect(buildBibleHubUrl("John", 3, 16)).toBe("https://biblehub.com/john/3-16.htm");
    expect(buildBibleHubUrl("Romans", 8, 1)).toBe("https://biblehub.com/romans/8-1.htm");
  });

  it("builds numbered book URLs", () => {
    expect(buildBibleHubUrl("1 Corinthians", 13, 4)).toBe("https://biblehub.com/1_corinthians/13-4.htm");
  });
});

describe("document conversion", () => {
  it("converts simple references", () => {
    expect(convertBibleReferences("Read John 3:16 today.", DEFAULT_SETTINGS)).toBe(
      "Read [John 3:16](https://biblehub.com/john/3-16.htm) today."
    );
  });

  it("converts numbered books", () => {
    expect(convertBibleReferences("Love is in 1 Corinthians 13:4.", DEFAULT_SETTINGS)).toBe(
      "Love is in [1 Corinthians 13:4](https://biblehub.com/1_corinthians/13-4.htm)."
    );
  });

  it("converts abbreviations while preserving visible text", () => {
    expect(convertBibleReferences("See 1 Cor 13:4 and Rom 8:1.", DEFAULT_SETTINGS)).toBe(
      "See [1 Cor 13:4](https://biblehub.com/1_corinthians/13-4.htm) and [Rom 8:1](https://biblehub.com/romans/8-1.htm)."
    );
  });

  it("links verse ranges to the first verse", () => {
    expect(convertBibleReferences("Memorize 1 Corinthians 13:4-7.", DEFAULT_SETTINGS)).toBe(
      "Memorize [1 Corinthians 13:4-7](https://biblehub.com/1_corinthians/13-4.htm)."
    );
  });

  it("links verse ranges written with an en dash to the first verse", () => {
    expect(convertBibleReferences("Foundation: 1 Corinthians 3:11–15.", DEFAULT_SETTINGS)).toBe(
      "Foundation: [1 Corinthians 3:11–15](https://biblehub.com/1_corinthians/3-11.htm)."
    );
  });

  it("does not convert existing markdown links", () => {
    const text = "[John 3:16](https://biblehub.com/john/3-16.htm) and Romans 8:1";
    expect(convertBibleReferences(text, DEFAULT_SETTINGS)).toBe(
      "[John 3:16](https://biblehub.com/john/3-16.htm) and [Romans 8:1](https://biblehub.com/romans/8-1.htm)"
    );
  });

  it("does not convert inline code", () => {
    expect(convertBibleReferences("Use `John 3:16` but convert Romans 8:1.", DEFAULT_SETTINGS)).toBe(
      "Use `John 3:16` but convert [Romans 8:1](https://biblehub.com/romans/8-1.htm)."
    );
  });

  it("does not convert fenced code blocks", () => {
    const input = "```md\nJohn 3:16\n```\nRomans 8:1";
    expect(convertBibleReferences(input, DEFAULT_SETTINGS)).toBe(
      "```md\nJohn 3:16\n```\n[Romans 8:1](https://biblehub.com/romans/8-1.htm)"
    );
  });

  it("converts selected text without depending on document context", () => {
    expect(convertBibleReferences("John 3:16; Rom 8:1", DEFAULT_SETTINGS)).toBe(
      "[John 3:16](https://biblehub.com/john/3-16.htm); [Rom 8:1](https://biblehub.com/romans/8-1.htm)"
    );
  });

  it("converts command text even when live auto-linking is disabled", () => {
    expect(
      convertBibleReferences("John 3:16", {
        ...DEFAULT_SETTINGS,
        enableAutoLink: false
      })
    ).toBe("[John 3:16](https://biblehub.com/john/3-16.htm)");
  });
});

describe("paste conversion", () => {
  it("converts pasted references even without a trailing delimiter", () => {
    expect(convertPastedText("John 3:16", DEFAULT_SETTINGS)).toBe(
      "[John 3:16](https://biblehub.com/john/3-16.htm)"
    );
  });

  it("converts bold references in pasted verse text", () => {
    expect(convertPastedText("**Hebrews 12:29**\n\n> \"For our God is a consuming fire.\"", DEFAULT_SETTINGS)).toBe(
      "**[Hebrews 12:29](https://biblehub.com/hebrews/12-29.htm)**\n\n> \"For our God is a consuming fire.\""
    );
  });
});

describe("trailing auto-link conversion", () => {
  it("converts the reference immediately before a typed delimiter", () => {
    const result = convertTrailingReference("Read John 3:16 ", DEFAULT_SETTINGS);
    expect(result).toEqual({
      from: 5,
      to: 14,
      replacement: "[John 3:16](https://biblehub.com/john/3-16.htm)"
    });
  });

  it("does not convert inside existing links", () => {
    expect(
      convertTrailingReference("[John 3:16](https://biblehub.com/john/3-16.htm) ", DEFAULT_SETTINGS)
    ).toBeNull();
  });

  it("does not convert URLs", () => {
    expect(convertTrailingReference("https://example.com/John 3:16 ", DEFAULT_SETTINGS)).toBeNull();
  });

  it("does not convert inside an unclosed fenced code block", () => {
    expect(convertTrailingReference("```md\nJohn 3:16 ", DEFAULT_SETTINGS)).toBeNull();
  });

  it("does not convert inside an unclosed inline code span", () => {
    expect(convertTrailingReference("Use `John 3:16 ", DEFAULT_SETTINGS)).toBeNull();
  });
});
