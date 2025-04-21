import * as vscode from 'vscode';
import * as path from 'path';
import { FileAnalyzeResult } from '../analyze/file_analyze/file_analyzer';

/**
 * 파일 분석 결과를 출력 채널에 표시합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param result 파일 분석 결과
 * @param outputChannel 기존 출력 채널 (선택적, 없으면 새로 생성)
 * @returns 사용된 출력 채널
 */
export function displayFileAnalyzeResult(
    workspacePath: string,
    result: FileAnalyzeResult,
    outputChannel?: vscode.OutputChannel
): vscode.OutputChannel {
    // 출력 채널이 제공되지 않은 경우 새로 생성
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Flutter Tidy');
    }

    const { allFiles, importedFiles, unusedFiles } = result;

    outputChannel.appendLine(`📊 File Usage Analysis Results`);
    outputChannel.appendLine(`▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔`);
    outputChannel.appendLine(`- Total Dart files: ${allFiles.length}`);
    outputChannel.appendLine(`- Referenced files: ${importedFiles.size}`);
    outputChannel.appendLine(`- Unused files: ${unusedFiles.length}`);
    outputChannel.appendLine('');

    if (unusedFiles.length > 0) {
        outputChannel.appendLine(`❗ ${unusedFiles.length} unused files found:`);
        outputChannel.appendLine('These files are not referenced by any other file in your project:');
        outputChannel.appendLine('');

        unusedFiles.forEach((filePath) => {
            const absolutePath = path.resolve(workspacePath, filePath);
            // 파일 경로를 클릭하면 열 수 있는 링크 형식으로 표시
            outputChannel.appendLine(`▢ ${absolutePath}`);
        });

        outputChannel.appendLine('');
        outputChannel.appendLine(`💡 Tips:`);
        outputChannel.appendLine(`- Analysis includes: import, export, part, part of, and library references`);
        outputChannel.appendLine(`- Entry point files like main.dart are automatically excluded`);
        outputChannel.appendLine(`- Some files may be used dynamically through reflection or initialization`);
        outputChannel.appendLine(`- Consider removing truly unused files to keep your codebase clean`);
    } else {
        outputChannel.appendLine(`✅ All Dart files in lib/ are properly referenced!`);
    }

    return outputChannel;
} 