import * as vscode from 'vscode';
import {
	analyzeUnusedAssets,
	analyzeUnusedDependencies,
	analyzeUnusedFiles,
	analyzeAll
} from './commands/analyzer_commands';

/**
 * 확장 기능 활성화 시 호출됩니다.
 */
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('flutter-tidy.analyze-unused-assets', analyzeUnusedAssets),
		vscode.commands.registerCommand('flutter-tidy.analyze-unused-dependencies', analyzeUnusedDependencies),
		vscode.commands.registerCommand('flutter-tidy.analyze-unused-files', analyzeUnusedFiles),
		vscode.commands.registerCommand('flutter-tidy.analyze-unused', analyzeAll)
	);
}

/**
 * 확장 기능 비활성화 시 호출됩니다.
 */
export function deactivate() { }
