import * as opencc from 'opencc-js';
import * as vscode from 'vscode';
import { stringDiff } from '../utils/diff';
import {
  getConverterOptions,
  getIgnoreWords
} from '../settings';

export async function registerTranslateSelectionCommand(textEditor: vscode.TextEditor, isRevert: boolean = false) {
  const ignoreWords = await getIgnoreWords();

  let document: vscode.TextDocument = textEditor.document;
  let selection = textEditor.selection;

  const options: opencc.ConverterOptions = getConverterOptions();
  if (isRevert) {
    const { from, to } = options;
    options.from = to;
    options.to = from;
  }
  const converter: opencc.ConvertText = opencc.Converter(options);

  let text = document.getText(selection);

  if (ignoreWords.length) { // ignore words when select full text
    const re = new RegExp(`(${ignoreWords.join('|')})`, "g");
    text = text.replace(re, ($1) => 'O'.repeat($1.length));
  }

  const result = converter(text);
  const diffs = stringDiff(text, result, false); // get text diff

  textEditor.edit((builder) => {
    for (const diff of diffs) {
      const key = diff.modifiedLength ? 'modified' : 'original';
      const selectionStart = document.offsetAt(textEditor.selection.start);
      const positionStart = diff[`${key}Start`];
      const positionEnd = diff[`${key}Start`] + diff[`${key}Length`];
      const range: vscode.Range = new vscode.Range(
        document.positionAt(selectionStart + positionStart),
        document.positionAt(selectionStart + positionEnd)
      );
      const replaceText = result.substring(positionStart, positionEnd);
      builder.replace(range, replaceText);
    }
  });
}
