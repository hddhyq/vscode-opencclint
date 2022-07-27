import * as opencc from 'opencc-js';
import * as vscode from 'vscode';

export function registerTranslateSelectionCommand() {
  const register = vscode.commands.registerTextEditorCommand(
    "opencclint.reverseWord",
    (textEditor: vscode.TextEditor) => {
    const options: opencc.ConverterOptions = { from: 'cn', to: 'tw'};
    let document: vscode.TextDocument = textEditor.document;
    let selection: vscode.Selection | vscode.Range = textEditor.selection;

    if (selection.isEmpty) {
      const fullText = document.getText();
      selection = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length - 1)
      );
    }

    const converter: opencc.ConvertText = opencc.Converter(options);
    let text = document.getText(selection);
    const result = converter(text);
    textEditor.edit((builder) => {
      builder.replace(selection, result);
    });
  });

  return register;
}
