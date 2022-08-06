// vscode.workspace.onDidSaveTextDocument(

import * as opencc from 'opencc-js';
import * as vscode from 'vscode';

export function registerSaveOnFormat() {
  const register = vscode.workspace.onWillSaveTextDocument(
    ({
      document,
      waitUntil
    }) => {
      const options: opencc.ConverterOptions = { from: 'cn', to: 'tw' };
      const textEditor = vscode.window.visibleTextEditors.find(
        (editor) => editor.document === document
      );

      if (textEditor) {
        const fullText = document.getText();
        const selection: vscode.Range = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fullText.length - 1)
        );

        const converter: opencc.ConvertText = opencc.Converter(options);
        let text = document.getText(selection);

        const result = converter(text);
        console.log(selection, result);
        waitUntil(textEditor.edit((builder) => {
          builder.replace(selection, result);
        }));
      }
    });

  return register;
}
