import * as vscode from 'vscode';
import * as opencc from 'opencc-js';
import * as path from 'path';
import { cosmiconfigSync } from 'cosmiconfig';
import ignore from 'ignore';

const explorerSimplify = cosmiconfigSync('simplify'); // old file type, for compatibility
const explorerOpencclint = cosmiconfigSync('opencclint');

export function getConfig<T>(section: string) {
  return vscode.workspace.getConfiguration("opencclint").get<T>(section)!;
}

export function getDocumentSelector() {
  return getConfig<string[]>('languages').map((id) => {
    return { language: id, scheme: "file" };
  });
}

export function isIncludeLanguages(document: vscode.TextDocument) {
  return getDocumentSelector().some(selector => {
    return vscode.languages.match(selector, document) === 10;
  });
}

export function isDebug() {
  return getConfig<boolean>('debug');
}

export function getConverterOptions(): opencc.ConverterOptions {
  const configOption = getConfig<string>('converterOptions');
  let formatOption = configOption.split('=>') as opencc.Locale[];

  const condition = formatOption.every(v => ["cn", "tw", "twp", "hk", "jp", "t"].includes(v));

  if (!condition) {
    vscode.window.showErrorMessage("opencclint.ConverterOptions error, back to 'cn=>tw' setting.");
    formatOption = ["cn", "tw"];
  }

  return {
    from: formatOption[0],
    to: formatOption[1],
  };
}

export function getAutoFixOnSave(): boolean {
  return getConfig<boolean>('autoFixOnSave');
}

export async function getIgnoreWords(): Promise<string[]> {
  const folders = vscode.workspace.workspaceFolders;

  // TODO: support mulitple root
  if (!folders || folders.length > 1) {
    return [];
  }

  if (isDebug()) {
    vscode.window.showInformationMessage(JSON.stringify(folders));
  }

  let ignoreWords: string[] = [];
  const simplifyResult = await explorerSimplify.search(folders[0].uri.fsPath);
  const opencclintResult = await explorerOpencclint.search(folders[0].uri.fsPath);


  if (simplifyResult) {
    ignoreWords.push(...Object.keys(simplifyResult?.config.ignoreTexts ?? {}));
  }

  if (opencclintResult) {
    ignoreWords.push(...(opencclintResult?.config.ignoreWords ?? []));
  }

  if (ignoreWords.some(v => typeof v !== 'string')) {
    vscode.window.showErrorMessage('Opencclint ignoreWords malformat');
  }

  return ignoreWords;
}

export async function getExclude(): Promise<string[]> {
  const folders = vscode.workspace.workspaceFolders;

  // TODO: support mulitple root
  if (!folders || folders.length > 1) {
    return [];
  }

  let exclude: string[] = [];
  const simplifyResult = await explorerSimplify.search(folders[0].uri.fsPath);
  const opencclintResult = await explorerOpencclint.search(folders[0].uri.fsPath);

  if (simplifyResult) {
    exclude.push(...(simplifyResult?.config.exclude ?? []));
  }

  if (opencclintResult) {
    exclude.push(...(opencclintResult?.config.exclude ?? []));
  }

  return exclude;
}

export async function compareIsExclude(document: vscode.TextDocument): Promise<boolean> {
  const folders = vscode.workspace.workspaceFolders;

  // TODO: support mulitple root
  if (!folders || folders.length > 1) {
    return true;
  }

  const folderFsPath = folders[0].uri.fsPath;
  const fileFsPath = document.uri.fsPath;
  const filePath = fileFsPath.split(folderFsPath)[1].split(path.sep).join(path.posix.sep).substring(1);
  const simplifyResult = explorerSimplify.search(folders![0].uri.fsPath);
  const opencclintResult = explorerOpencclint.search(folders![0].uri.fsPath);

  const exclude = [
    ...await getExclude(),
    simplifyResult?.filepath || '',
    opencclintResult?.filepath || '',
  ];

  const ig = ignore().add(exclude);

  return ig.ignores(filePath);
}
