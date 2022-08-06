import * as opencc from 'opencc-js';
import * as vscode from 'vscode';

export function registerTranslateOnSave() {
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
        const text = document.getText(selection);
        const result = converter(text);

        waitUntil(textEditor.edit((builder) => {
          builder.replace(selection, result);
        }));
      }
    });

  return register;
}
