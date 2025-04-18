import * as vscode from 'vscode';
import * as path from 'path';
import { AssetAnalyzeResult } from './asset_analyzer';

/**
 * 에셋 분석 결과를 출력 채널에 표시합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param result 에셋 분석 결과
 */
export function displayAssetAnalyzeResult(workspacePath: string, result: AssetAnalyzeResult): void {
    const outputChannel = vscode.window.createOutputChannel('Flutter Tidy: Unused Assets');
    outputChannel.clear();

    const { allAssets, usedAssets, unusedAssets } = result;

    outputChannel.appendLine(`📊 Assets Analysis Results`);
    outputChannel.appendLine(`- Total: ${allAssets.length}`);
    outputChannel.appendLine(`- Used: ${usedAssets.size}`);
    outputChannel.appendLine(`- Unused: ${unusedAssets.length}`);
    outputChannel.appendLine('');

    if (unusedAssets.length > 0) {
        outputChannel.appendLine(`❗ ${unusedAssets.length} unused assets found`);

        unusedAssets.forEach((assetPath) => {
            const absolutePath = path.resolve(workspacePath, assetPath);
            outputChannel.appendLine(`▢ ${absolutePath}`);
        });

        outputChannel.appendLine('');
        outputChannel.appendLine(`💡 Consider removing these assets to reduce app size!`);
    } else {
        outputChannel.appendLine(`✅ All assets are being used in your project!`);
    }

    outputChannel.show();
} 