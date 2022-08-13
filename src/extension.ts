import * as vscode from 'vscode';
import {
  registerTranslateOnSave,
  registerTranslateFileCommand,
  registerTranslateSelectionCommand
} from './commands';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // commands
    vscode.commands.registerTextEditorCommand("opencclint.translateFile", registerTranslateFileCommand),
    vscode.commands.registerTextEditorCommand("opencclint.translateSelection", registerTranslateSelectionCommand),

    // events
    vscode.workspace.onWillSaveTextDocument(registerTranslateOnSave),
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
