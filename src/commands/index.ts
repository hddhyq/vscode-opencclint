import * as vscode from 'vscode';
import { registerTranslateSelectionCommand } from './translateSelection';

const translateSelectionCommand = registerTranslateSelectionCommand();

export const commands = [
  translateSelectionCommand,
];


