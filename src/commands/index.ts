import { registerTranslateFileCommand } from './translateFile';

const translateSelectionCommand = registerTranslateFileCommand();

export const commands = [
  translateSelectionCommand,
];


