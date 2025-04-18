import * as vscode from 'vscode';
import { extractAssetsFromPubspec } from './utils/asset/pubspec_asset_parser';
import { findDirectlyUsedAssets } from './utils/asset/asset_reference_finder';
import { extractStaticAssetReferences } from './utils/asset/static_asset_parser';
import { findUsedStaticVariables } from './utils/asset/static_usage_tracker';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('flutter-tidy.find-unused-assets', async () => {
			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace folder found!');
				return;
			}

			const allAssets = extractAssetsFromPubspec(workspacePath);

			const directlyUsedAssets = findDirectlyUsedAssets(workspacePath, allAssets);

			const staticReferences = extractStaticAssetReferences(workspacePath);

			const usedStaticVariables = findUsedStaticVariables(workspacePath, staticReferences);

			const indirectlyUsedAssets = staticReferences
				.filter(ref => usedStaticVariables.has(`${ref.className}.${ref.variableName}`))
				.map(ref => ref.assetPath);

			const definedButUnusedAssets = staticReferences
				.filter(ref => !usedStaticVariables.has(`${ref.className}.${ref.variableName}`))
				.map(ref => ref.assetPath);

			const trulyDirectlyUsedAssets = [...directlyUsedAssets].filter(
				asset => !definedButUnusedAssets.includes(asset)
			);

			const usedAssets = new Set([
				...trulyDirectlyUsedAssets,
				...indirectlyUsedAssets,
			]);

			const unusedAssets = allAssets.filter(asset => !usedAssets.has(asset));

			vscode.window.showInformationMessage(
				`📊 Assets - Total: ${allAssets.length}, Used: ${usedAssets.size}, Unused: ${unusedAssets.length}`
			);
		}),

		vscode.commands.registerCommand('flutter-tidy.find-unused-classes', () => {
			vscode.window.showInformationMessage('Running unused class detection...');
		}),

		vscode.commands.registerCommand('flutter-tidy.find-unused-dependencies', () => {
			vscode.window.showInformationMessage('Running unused dependency detection...');
		}),
	);
}

export function deactivate() { }
