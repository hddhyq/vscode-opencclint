import * as vscode from 'vscode';
import { registerTranslateOnSave, registerTranslateFileCommand } from './commands';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // commands
    vscode.commands.registerTextEditorCommand("opencclint.translateFile", registerTranslateFileCommand),

    // events
    vscode.workspace.onWillSaveTextDocument(registerTranslateOnSave),
    // vscode.workspace.onDidChangeConfiguration(handleOnDidChangeConfiguration)
  );

  // function handleOnDidChangeConfiguration(event: vscode.ConfigurationChangeEvent) {
  //   if (event.affectsConfiguration('opencclint')) {
  //     readConfiguration();
  //   }
  // }

  // function readConfiguration() {

  // }

}

// this method is called when your extension is deactivated
export function deactivate() { }
