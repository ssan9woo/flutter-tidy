import * as vscode from 'vscode';
import { displayAssetAnalyzeResult } from './asset_analyze/asset_analyze_output';
import { analyzeAssetUsage } from './asset_analyze/asset_analyzer';
import { analyzePackageUsage } from './package_analyze/package_analyzer';
import { displayPackageAnalyzeResult } from './package_analyze/package_analyze_output';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('flutter-tidy.find-unused-assets', async () => {
			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace folder found!');
				return;
			}

			vscode.window.showInformationMessage('Analyzing assets usage...');

			const analyzeResult = analyzeAssetUsage(workspacePath);

			displayAssetAnalyzeResult(workspacePath, analyzeResult);

			vscode.window.showInformationMessage('Asset analysis completed!');
		}),

		vscode.commands.registerCommand('flutter-tidy.find-unused-classes', () => {
			vscode.window.showInformationMessage('Running unused class detection...');
		}),

		vscode.commands.registerCommand('flutter-tidy.find-unused-dependencies', () => {
			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace folder found!');
				return;
			}

			vscode.window.showInformationMessage('Analyzing package dependencies...');

			const analyzeResult = analyzePackageUsage(workspacePath);

			displayPackageAnalyzeResult(workspacePath, analyzeResult);

			vscode.window.showInformationMessage('Dependency analysis completed!');
		}),
	);
}

export function deactivate() { }
