import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

interface CollectFilesOptions {
    /** 수집할 파일의 확장자 (예: '.dart', '.ts') */
    extension?: string;
    /** 제외할 디렉토리 이름 목록 */
    excludeDirectories?: string[];
}

/**
 * 현재 워크스페이스의 루트 경로를 가져옵니다.
 * 
 * @returns 워크스페이스 경로 또는 undefined (오류 발생 시)
 */
export function getWorkspacePath(): string | undefined {
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
        vscode.window.showErrorMessage('No workspace folder found!');
        return undefined;
    }
    return workspacePath;
}

/**
 * 지정된 디렉토리 내의 모든 파일을 재귀적으로 수집합니다.
 * 
 * @param dir 검색할 디렉토리 경로
 * @param options 파일 수집 옵션 (확장자 및 제외할 디렉토리 지정)
 * @returns 수집된 파일의 절대 경로 배열
 */
function collectFilesInternal(dir: string, options?: CollectFilesOptions): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return results;
    }

    try {
        for (const entry of fs.readdirSync(dir)) {
            // 제외할 디렉토리 체크
            if (options?.excludeDirectories?.includes(entry)) {
                continue;
            }

            const fullPath = path.join(dir, entry);
            try {
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    // 숨김 디렉토리 제외
                    if (!entry.startsWith('.')) {
                        results.push(...collectFilesInternal(fullPath, options));
                    }
                } else if (!options?.extension || entry.endsWith(options.extension)) {
                    results.push(fullPath);
                }
            } catch (statError) {
                console.warn(`Could not access: ${fullPath}. Skipping.`);
            }
        }
    } catch (readDirError) {
        console.error(`Error reading directory: ${dir}`, readDirError);
    }

    return results;
}

/**
 * 지정된 디렉토리 및 하위 디렉토리에서 모든 .dart 파일의 경로를 재귀적으로 수집합니다.
 *
 * @param dir 검색을 시작할 디렉토리 경로
 * @returns 찾은 .dart 파일 경로의 배열
 */
export function collectDartFiles(dir: string): string[] {
    return collectFilesInternal(dir, {
        extension: '.dart',
        excludeDirectories: ['build', 'node_modules']
    });
}

/**
 * 지정된 디렉토리 내의 모든 파일 경로를 재귀적으로 수집합니다.
 *
 * @param dir 검색할 디렉토리 경로
 * @returns 수집된 파일 경로들의 배열
 */
export function collectFiles(dir: string): string[] {
    return collectFilesInternal(dir);
}

/**
 * 지정된 확장자를 가진 파일들을 재귀적으로 수집합니다.
 * 
 * @param dir 검색할 디렉토리 경로
 * @param extension 수집할 파일의 확장자 (예: '.ts', '.json')
 * @param excludeDirectories 제외할 디렉토리 목록 (선택적)
 * @returns 수집된 파일 경로들의 배열
 */
export function collectFilesByExtension(
    dir: string,
    extension: string,
    excludeDirectories?: string[]
): string[] {
    return collectFilesInternal(dir, { extension, excludeDirectories });
} 