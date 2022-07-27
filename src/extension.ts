import * as vscode from 'vscode';
import { commands } from './commands';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(...commands);
}

// this method is called when your extension is deactivated
export function deactivate() { }
