import * as vscode from 'vscode';
import * as path from 'path';
import { AssetAnalyzeResult } from '../analyze/asset_analyze/models/asset_analyze_models';

/**
 * 에셋 분석 결과를 출력 채널에 표시합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param result 에셋 분석 결과
 * @param outputChannel 기존 출력 채널 (선택적, 없으면 새로 생성)
 * @returns 사용된 출력 채널
 */
export function displayAssetAnalyzeResult(
    workspacePath: string,
    result: AssetAnalyzeResult,
    outputChannel?: vscode.OutputChannel
): vscode.OutputChannel {
    // 출력 채널이 제공되지 않은 경우 새로 생성
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Flutter Tidy');
        outputChannel.clear();
    }

    const { allAssets, usedAssets, unusedAssets } = result;

    outputChannel.appendLine(`📊 Assets Analysis Results`);
    outputChannel.appendLine(`- Total: ${allAssets.length}`);
    outputChannel.appendLine(`- Used: ${usedAssets.length}`);
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

    return outputChannel;
} 