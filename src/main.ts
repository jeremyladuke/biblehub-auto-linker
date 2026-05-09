import {
  App,
  Editor,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from "obsidian";
import {
  BOOKS,
  BibleHubAutoLinkerSettings,
  DEFAULT_SETTINGS,
  convertBibleReferences,
  convertPastedText,
  convertTrailingReference,
  isRangeProtectedInMarkdown
} from "./linker";

export default class BibleHubAutoLinkerPlugin extends Plugin {
  settings: BibleHubAutoLinkerSettings;
  private isApplyingChange = false;

  async onload(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };

    this.addSettingTab(new BibleHubAutoLinkerSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("editor-change", (editor) => {
        this.handleEditorChange(editor);
      })
    );

    this.registerDomEvent(document, "paste", (event) => {
      this.handlePaste(event);
    });

    this.addCommand({
      id: "convert-bible-references-current-note",
      name: "Convert Bible references in current note",
      editorCallback: (editor) => {
        const original = editor.getValue();
        const converted = convertBibleReferences(original, this.settings);
        if (converted !== original) {
          editor.setValue(converted);
          new Notice("Converted Bible references to BibleHub links.");
        } else {
          new Notice("No unlinked Bible references found.");
        }
      }
    });

    this.addCommand({
      id: "convert-selected-bible-references",
      name: "Convert selected Bible references",
      editorCallback: (editor) => {
        const selectedText = editor.getSelection();
        if (!selectedText) {
          new Notice("Select Bible references to convert first.");
          return;
        }

        const converted = convertBibleReferences(selectedText, this.settings);
        if (converted !== selectedText) {
          editor.replaceSelection(converted);
          new Notice("Converted selected Bible references.");
        } else {
          new Notice("No unlinked Bible references found in selection.");
        }
      }
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private handleEditorChange(editor: Editor): void {
    if (this.isApplyingChange || !this.settings.enableAutoLink) {
      return;
    }

    const cursor = editor.getCursor();
    const textBeforeCursor = editor.getRange({ line: 0, ch: 0 }, cursor);
    const conversion = convertTrailingReference(textBeforeCursor, this.settings);
    if (!conversion) {
      return;
    }

    this.isApplyingChange = true;
    try {
      editor.replaceRange(
        conversion.replacement,
        editor.offsetToPos(conversion.from),
        editor.offsetToPos(conversion.to)
      );
    } finally {
      this.isApplyingChange = false;
    }
  }

  private handlePaste(event: ClipboardEvent): void {
    if (this.isApplyingChange || !this.settings.enableAutoLink) {
      return;
    }

    const pastedText = event.clipboardData?.getData("text/plain");
    if (!pastedText) {
      return;
    }

    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }

    const editor = markdownView.editor;
    const pasteStart = editor.posToOffset(editor.getCursor("from"));
    const normalizedPaste = pastedText.replace(/\r\n?/g, "\n");

    window.setTimeout(() => {
      if (this.isApplyingChange) {
        return;
      }

      const pasteEnd = pasteStart + normalizedPaste.length;
      const documentText = editor.getValue();
      if (pasteEnd > documentText.length || isRangeProtectedInMarkdown(documentText, pasteStart, pasteEnd)) {
        return;
      }

      const from = editor.offsetToPos(pasteStart);
      const to = editor.offsetToPos(pasteEnd);
      const insertedText = editor.getRange(from, to);
      const converted = convertPastedText(insertedText, this.settings);
      if (converted === insertedText) {
        return;
      }

      this.isApplyingChange = true;
      try {
        editor.replaceRange(converted, from, to);
      } finally {
        this.isApplyingChange = false;
      }
    }, 0);
  }
}

class BibleHubAutoLinkerSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: BibleHubAutoLinkerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "BibleHub Auto Linker" });

    new Setting(containerEl)
      .setName("Enable auto-link")
      .setDesc("Convert references as you type after a natural delimiter.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableAutoLink).onChange(async (value) => {
          this.plugin.settings.enableAutoLink = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Link provider")
      .setDesc("BibleHub is currently the only provider.")
      .addText((text) =>
        text.setValue(this.plugin.settings.linkProvider).setDisabled(true)
      );

    new Setting(containerEl)
      .setName("Open in new pane")
      .setDesc("Placeholder for future provider behavior.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.openInNewPane).onChange(async (value) => {
          this.plugin.settings.openInNewPane = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Use first verse URL for ranges")
      .setDesc("BibleHub range references link to the first verse.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.convertRangesToFirstVerseUrl).onChange(async (value) => {
          this.plugin.settings.convertRangesToFirstVerseUrl = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Enable abbreviations")
      .setDesc("Recognize common abbreviations such as Jn, Rom, and 1 Cor.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableAbbreviations).onChange(async (value) => {
          this.plugin.settings.enableAbbreviations = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Require trigger after reference")
      .setDesc("Only auto-link after a space, punctuation mark, newline, or similar delimiter.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.requireTriggerAfterReference).onChange(async (value) => {
          this.plugin.settings.requireTriggerAfterReference = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Enabled books")
      .setDesc("Comma-separated canonical book names. All 66 books are enabled by default.")
      .addTextArea((text) => {
        text.inputEl.rows = 6;
        text
          .setValue(this.plugin.settings.enabledBooks.join(", "))
          .onChange(async (value) => {
            const requested = value
              .split(",")
              .map((book) => book.trim())
              .filter(Boolean);
            const canonicalBooks = new Set(BOOKS.map((book) => book.canonical));
            this.plugin.settings.enabledBooks = requested.filter((book) => canonicalBooks.has(book));
            await this.plugin.saveSettings();
          });
      });
  }
}
