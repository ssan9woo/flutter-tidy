import * as path from 'path';
import { collectDartFiles } from '../../utils/file_utils';
import { findImportedFiles } from './finder/imported_file_finder';

/**
 * 파일 분석 결과를 나타내는 인터페이스
 */
export interface FileAnalyzeResult {
    /** 모든 Dart 파일 경로 (절대 경로) */
    allFiles: string[];
    /** 다른 파일에서 참조되는 파일 경로 (절대 경로) */
    importedFiles: Set<string>;
    /** 다른 파일에서 참조되지 않는 파일 경로 (절대 경로) */
    unusedFiles: string[];
}

/**
 * 프로젝트 내의 사용되지 않는 파일을 분석합니다.
 * import, export, part, part of, library 등 다양한 참조 구문을 통해
 * 다른 파일에서 참조되지 않는 파일을 찾습니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns 모든 파일, 참조되는 파일, 미사용 파일 목록 (절대 경로)
 */
export function analyzeFileUsage(workspacePath: string): FileAnalyzeResult {
    // 1. lib 디렉토리 내의 모든 Dart 파일 수집 (절대 경로)
    const libDir = path.join(workspacePath, 'lib');
    const absoluteFiles = collectDartFiles(libDir);

    // 2. 참조되는 파일들 찾기 (절대 경로 Set)
    // (import, export, part, part of, library 구문 모두 고려)
    const importedFilesAbsolute = findImportedFiles(workspacePath, absoluteFiles);

    // 3. 미사용 파일 계산 (절대 경로 리스트)
    const unusedFilesAbsolute = absoluteFiles.filter(file => !importedFilesAbsolute.has(file));

    // 4. 최종 결과를 절대 경로로 반환
    return {
        allFiles: absoluteFiles,
        importedFiles: importedFilesAbsolute,
        unusedFiles: unusedFilesAbsolute
    };
} 