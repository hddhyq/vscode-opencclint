import * as opencc from 'opencc-js';
import * as vscode from 'vscode';
import { stringDiff } from '../utils/diff';
import {
  isIncludeLanguages,
  getConverterOptions,
  isDebug,
  getAutoFixOnSave,
  getIgnoreWords,
  compareIsExclude
} from '../settings';

export async function registerTranslateOnSave(e: vscode.TextDocumentWillSaveEvent) {
  const { document, waitUntil } = e;
  const textEditor = vscode.window.activeTextEditor;

  if (isDebug()) {
    vscode.window.showInformationMessage(JSON.stringify(document));
  }

  if (!isIncludeLanguages(document) || !getAutoFixOnSave() || !textEditor) {
    return;
  }

  async function textEdit() {
    const ignoreWords = await getIgnoreWords();
    const isExclude = await compareIsExclude(document);

    if (isExclude) {
      return;
    }

    const fullText = document.getText();
    const selection: vscode.Range = new vscode.Range(
      document.positionAt(0),
      document.positionAt(fullText.length - 1)
    );

    const options: opencc.ConverterOptions = getConverterOptions();
    const converter: opencc.ConvertText = opencc.Converter(options);
    let text = document.getText(selection);

    if (ignoreWords.length) {
      const re = new RegExp(`(${ignoreWords.join('|')})`, "g");
      text = text.replace(re, ($1) => 'O'.repeat($1.length));
    }

    const result = converter(text);
    const diffs = stringDiff(text, result, false);

    return textEditor!.edit((builder) => {
      for (const diff of diffs) {
        const key = diff.modifiedLength ? 'modified' : 'original';
        const positionStart = diff[`${key}Start`];
        const positionEnd = diff[`${key}Start`] + diff[`${key}Length`];
        const range: vscode.Range = new vscode.Range(
          document.positionAt(positionStart),
          document.positionAt(positionEnd)
        );
        const replaceText = result.substring(positionStart, positionEnd);
        builder.replace(range, replaceText);
      }
    });
  }

  waitUntil(textEdit());
}
