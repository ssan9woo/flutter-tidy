import * as vscode from 'vscode';
import { displayAssetAnalyzeResult } from '../output/asset_analyze_output';
import { analyzeAssetUsage } from '../analyze/asset_analyze/asset_analyzer';
import { analyzePackageUsage } from '../analyze/package_analyze/package_analyzer';
import { displayPackageAnalyzeResult } from '../output/package_analyze_output';
import { analyzeFileUsage } from '../analyze/file_analyze/file_analyzer';
import { displayFileAnalyzeResult } from '../output/file_analyze_output';
import { showStatusBarProgress, delay } from '../utils/ui_utils';
import { getWorkspacePath } from '../utils/file_utils';
import { displayAllAnalyzeResult, AllAnalyzeResult } from '../output/all_analyze_output';

/**
 * 공통 분석 작업을 수행하는 헬퍼 함수
 * 
 * @param title 분석 타이틀 (상태 표시줄 및 알림에 표시)
 * @param analyzeFunction 실제 분석을 수행하는 함수
 * @returns 작업 완료 시 Promise
 */
async function runAnalysis<T>(
    title: string,
    analyzeFunction: (workspacePath: string) => T,
    displayFunction: (workspacePath: string, result: T, outputChannel?: vscode.OutputChannel) => vscode.OutputChannel
): Promise<void> {
    const workspacePath = getWorkspacePath();
    if (!workspacePath) return;

    // 상태 표시줄에 진행 상황 표시
    const statusBarItem = showStatusBarProgress(`Analyzing ${title}...`);

    // UI 업데이트를 위한 이벤트 루프 처리
    await delay(10);

    // 비동기 분석 처리
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Flutter Tidy',
            cancellable: false
        },
        async (progress) => {
            progress.report({ message: `Analyzing ${title}...` });
            const result = analyzeFunction(workspacePath);
            const outputChannel = displayFunction(workspacePath, result);
            outputChannel.show();
            return;
        }
    );

    // 상태 표시줄 항목 제거 및 완료 메시지 표시
    statusBarItem.dispose();
    vscode.window.showInformationMessage(`${title} analysis completed!`);
}

/**
 * 자산 분석을 수행합니다.
 */
export async function analyzeUnusedAssets(): Promise<void> {
    await runAnalysis('assets', analyzeAssetUsage, displayAssetAnalyzeResult);
}

/**
 * 패키지 의존성 분석을 수행합니다.
 */
export async function analyzeUnusedDependencies(): Promise<void> {
    await runAnalysis('dependencies',
        analyzePackageUsage,
        (workspacePath, result, outputChannel) => displayPackageAnalyzeResult(result, outputChannel));
}

/**
 * 파일 사용 분석을 수행합니다.
 */
export async function analyzeUnusedFiles(): Promise<void> {
    await runAnalysis('files', analyzeFileUsage, displayFileAnalyzeResult);
}

/**
 * 모든 분석(에셋, 의존성, 파일)을 수행합니다.
 */
export async function analyzeAll(): Promise<void> {
    // 통합 분석 함수 정의
    const analyzeAllFunction = (workspacePath: string): AllAnalyzeResult => {
        const assetResult = analyzeAssetUsage(workspacePath);
        const packageResult = analyzePackageUsage(workspacePath);
        const fileResult = analyzeFileUsage(workspacePath);
        return { assetResult, packageResult, fileResult };
    };

    // 공통 분석 헬퍼 함수 사용
    await runAnalysis('all', analyzeAllFunction, displayAllAnalyzeResult);
} 