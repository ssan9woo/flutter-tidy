import * as vscode from 'vscode';
import * as path from 'path';
import { analyzeAssetUsage } from '../analyze/asset_analyze/asset_analyzer';
import { analyzePackageUsage } from '../analyze/package_analyze/package_analyzer';
import { analyzeFileUsage } from '../analyze/file_analyze/file_analyzer';

// 통합 분석 결과를 나타내는 인터페이스
export interface AllAnalyzeResult {
    assetResult: ReturnType<typeof analyzeAssetUsage>;
    packageResult: ReturnType<typeof analyzePackageUsage>;
    fileResult: ReturnType<typeof analyzeFileUsage>;
}

/**
 * 모든 분석 결과를 통합하여 출력 채널에 표시합니다.
 * 기존 출력 함수에 의존하지 않고 간결하게 표시합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param result 통합 분석 결과
 * @param outputChannel 기존 출력 채널 (선택적)
 * @returns 출력 채널
 */
export function displayAllAnalyzeResult(
    workspacePath: string,
    result: AllAnalyzeResult,
    outputChannel?: vscode.OutputChannel
): vscode.OutputChannel {
    // 출력 채널 생성 또는 재사용
    const channel = outputChannel || vscode.window.createOutputChannel('Flutter Tidy');
    channel.clear();

    // 헤더 출력
    channel.appendLine('🔍 Flutter Tidy - Comprehensive Analysis Results');
    channel.appendLine('═════════════════════════════════════════════');
    channel.appendLine('');

    // 요약 정보 먼저 표시
    const unusedAssetCount = result.assetResult.unusedAssets.length;
    // 일반 의존성과 개발 의존성 결합하여 카운트
    const unusedPackageCount = result.packageResult.generic.unused.length + result.packageResult.dev.unused.length;
    const unusedFileCount = result.fileResult.unusedFiles.length;

    channel.appendLine(`📊 Summary`);
    channel.appendLine(`• Unused Assets: ${unusedAssetCount}`);
    channel.appendLine(`• Unused Packages: ${unusedPackageCount}`);
    channel.appendLine(`• Unused Files: ${unusedFileCount}`);
    channel.appendLine('');

    // 1. 에셋 분석 결과
    channel.appendLine('🖼️ Unused Assets');
    channel.appendLine('───────────────────────');

    if (unusedAssetCount === 0) {
        channel.appendLine('✅ All assets are being used in your project.');
    } else {
        // 절대 경로를 사용하여 에셋 표시 (asset_analyze_output.ts 참고)
        result.assetResult.unusedAssets.forEach((assetPath) => {
            const absolutePath = path.resolve(workspacePath, assetPath);
            channel.appendLine(`▢ ${absolutePath}`);
        });

        channel.appendLine('');
        channel.appendLine(`💡 Consider removing these assets to reduce app size.`);
    }

    channel.appendLine('');

    // 2. 패키지 분석 결과
    channel.appendLine('📦 Unused Packages');
    channel.appendLine('────────────────────────');

    if (unusedPackageCount === 0) {
        channel.appendLine('✅ All packages are being used in your project.');
    } else {
        // 일반 패키지
        if (result.packageResult.generic.unused.length > 0) {
            channel.appendLine('Regular Dependencies:');
            result.packageResult.generic.unused.forEach(pkg => {
                channel.appendLine(`• ${pkg}`);
            });
            channel.appendLine('');
        }

        // 개발 패키지
        if (result.packageResult.dev.unused.length > 0) {
            channel.appendLine('Dev Dependencies:');
            result.packageResult.dev.unused.forEach(pkg => {
                channel.appendLine(`• ${pkg}`);
            });
        }
    }

    channel.appendLine('');

    // 3. 파일 분석 결과
    channel.appendLine('📄 Unused Files');
    channel.appendLine('───────────────────────');

    if (unusedFileCount === 0) {
        channel.appendLine('✅ All files are being used in your project.');
    } else {
        // 절대 경로 그대로 표시
        result.fileResult.unusedFiles.sort().forEach(file => {
            channel.appendLine(`• ${file}`);
        });
    }

    // 최종 요약 및 가이드
    channel.appendLine('');
    channel.appendLine('═════════════════════════════════');
    channel.appendLine('🎯 Recommended Actions');
    channel.appendLine('• Unused assets: Remove from pubspec.yaml or start using them.');
    channel.appendLine('• Unused packages: Move to dev_dependencies or remove them.');
    channel.appendLine('• Unused files: Consider removing to keep your codebase clean.');
    channel.appendLine('');
    channel.appendLine('🎉 Flutter Tidy: Analysis completed!');

    return channel;
} 