import * as vscode from 'vscode';
import { PackageAnalyzeResult } from '../analyze/package_analyze/models/dependency_models';

/**
 * 패키지 의존성 분석 결과를 출력 채널에 표시합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param result 패키지 의존성 분석 결과
 * @param outputChannel 기존 출력 채널 (선택적, 없으면 새로 생성)
 * @returns 사용된 출력 채널
 */
export function displayPackageAnalyzeResult(
    result: PackageAnalyzeResult,
    outputChannel?: vscode.OutputChannel
): vscode.OutputChannel {
    // 출력 채널이 제공되지 않은 경우 새로 생성
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Flutter Tidy');
    }

    const { generic, dev } = result;

    // 일반 의존성 통계 출력
    outputChannel.appendLine(`📊 Dependencies Analysis Results`);
    outputChannel.appendLine(`▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔`);
    outputChannel.appendLine(`📦 Generic Dependencies:`);
    outputChannel.appendLine(`- Total: ${generic.all.length}`);
    outputChannel.appendLine(`- Used: ${generic.used.size}`);
    outputChannel.appendLine(`- Unused: ${generic.unused.length}`);
    outputChannel.appendLine('');

    // 미사용 일반 의존성 출력
    if (generic.unused.length > 0) {
        outputChannel.appendLine(`❗ ${generic.unused.length} unused generic dependencies found:`);

        generic.unused.forEach((packageName) => {
            outputChannel.appendLine(`▢ ${packageName}`);
        });

        outputChannel.appendLine('');
    } else {
        outputChannel.appendLine(`✅ All generic dependencies are being used in your project!`);
    }

    outputChannel.appendLine('');

    // 개발 의존성 통계 출력
    outputChannel.appendLine(`🔧 Dev Dependencies:`);
    outputChannel.appendLine(`- Total: ${dev.all.length}`);
    outputChannel.appendLine(`- Used: ${dev.used.size}`);
    outputChannel.appendLine(`- Potentially unused: ${dev.unused.length}`);
    outputChannel.appendLine('');

    // 잠재적으로 미사용 개발 의존성 출력
    if (dev.unused.length > 0) {
        outputChannel.appendLine(`⚠️ ${dev.unused.length} potentially unused dev dependencies:`);
        outputChannel.appendLine(`(Note: These may still be used in build processes or scripts)`);

        dev.unused.forEach((packageName) => {
            outputChannel.appendLine(`▢ ${packageName}`);
        });

        outputChannel.appendLine('');
    } else {
        outputChannel.appendLine(`✅ All dev dependencies seem to be essential!`);
    }

    outputChannel.appendLine('');
    outputChannel.appendLine(`💡 Tips:`);
    outputChannel.appendLine(`- Generic dependencies directly affect app size. Consider removing unused ones.`);
    outputChannel.appendLine(`- Dev dependencies don't affect app size but can impact build times.`);
    outputChannel.appendLine(`- Some dev dependencies like build_runner or code generators may not be`);
    outputChannel.appendLine(`  directly imported but are still necessary for your project.`);

    return outputChannel;
} 