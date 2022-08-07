import * as vscode from 'vscode';
import * as opencc from 'opencc-js';
import * as path from 'path';
import * as fs from 'fs';
import { cosmiconfigSync } from 'cosmiconfig';

/**
 *
 * "opencclint.autoFixOnSave": false,
 * "opencclint.languages": [
 *    "vue",
 *    "ts",
 *    "js"
 * ],
 * "opencclint.converterOptions": "cn=>tw",
 * "opencclint.ignoreWords": [
 *   "台",
 * ],
 * "opencclint.include": [
 *    "src"
 * ]
 */
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


const explorerSimplify = cosmiconfigSync('simplify'); // old file type
const explorerOpencclint = cosmiconfigSync('opencclint');

export async function getIgnoreWords(): Promise<string[]> {
  const folders = vscode.workspace.workspaceFolders;

  // TODO: support mulitple root
  if (!folders || folders.length > 1) {
    return [];
  }

  if (isDebug()) {
    vscode.window.showErrorMessage(JSON.stringify(folders));
  }

  let ignoreWords: string[] = [];
  const simplifyConfigFile = path.join(folders[0].uri.fsPath, 'simplify.config.js');
  const opencclintrcFile = path.join(folders[0].uri.fsPath, '.opencclintrc');

  if (fs.existsSync(simplifyConfigFile)) {
    const result = await explorerSimplify.load(simplifyConfigFile);
    ignoreWords.push(...Object.keys(result?.config.ignoreTexts ?? {}));
  }

  if (fs.existsSync(opencclintrcFile)) {
    const result = await explorerOpencclint.load(opencclintrcFile);
    ignoreWords.push(...Object.keys(result?.config.ignoreWords ?? {}));
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
  const simplifyConfigFile = path.join(folders[0].uri.fsPath, 'simplify.config.js');
  const opencclintrcFile = path.join(folders[0].uri.fsPath, '.opencclintrc');

  if (fs.existsSync(simplifyConfigFile)) {
    const result = await explorerSimplify.load(simplifyConfigFile);
    exclude.push(...Object.keys(result?.config.exclude ?? {}));
  }

  if (fs.existsSync(opencclintrcFile)) {
    const result = await explorerOpencclint.load(opencclintrcFile);
    exclude.push(...Object.keys(result?.config.exclude ?? {}));
  }

  return exclude;
}
