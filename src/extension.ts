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
    vscode.commands.registerTextEditorCommand("opencclint.translateFile", () => registerTranslateFileCommand(vscode.window.activeTextEditor!)),
    vscode.commands.registerTextEditorCommand("opencclint.translateSelection", () => registerTranslateSelectionCommand(vscode.window.activeTextEditor!)),
    vscode.commands.registerTextEditorCommand("opencclint.translateFileRevert", () => registerTranslateFileCommand(vscode.window.activeTextEditor!, true)),
    vscode.commands.registerTextEditorCommand("opencclint.translateSelectionRevert", () => registerTranslateSelectionCommand(vscode.window.activeTextEditor!, true)),

    // events
    vscode.workspace.onWillSaveTextDocument(registerTranslateOnSave),
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
