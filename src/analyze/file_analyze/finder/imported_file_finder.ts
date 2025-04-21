import * as fs from 'fs';
import * as path from 'path';

/**
 * Dart 파일의 참조 유형을 정의하는 열거형
 */
enum ReferenceType {
    IMPORT = 'import',
    EXPORT = 'export',
    PART = 'part',
    PART_OF = 'part of',
    LIBRARY = 'library'
}

/**
 * 파일 참조 정보를 나타내는 인터페이스
 */
interface FileReference {
    /** 참조 유형 (import, export, part 등) */
    type: ReferenceType;
    /** 참조 대상 파일의 절대 경로 */
    targetPath: string;
    /** 참조하는 소스 파일의 절대 경로 */
    sourcePath: string;
}

/**
 * 프로젝트 내의 모든 Dart 파일에서 다른 파일을 참조하는 모든 구문을 찾습니다.
 * import, export, part, part of, library 구문을 모두 처리합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param allFilesAbsolute lib 디렉토리의 모든 Dart 파일 절대 경로
 * @returns 다른 파일에서 참조되는 파일들의 집합 (절대 경로)
 */
export function findImportedFiles(workspacePath: string, allFilesAbsolute: string[]): Set<string> {
    // 모든 참조 정보 수집
    const references = collectAllReferences(workspacePath, allFilesAbsolute);

    // 모든 참조된 파일 추출
    const importedFilesAbsolute = new Set<string>();

    // 진입점 파일 자동 포함 (main.dart 등)
    const entryPoints = allFilesAbsolute.filter(file => {
        const relativePath = path.relative(workspacePath, file).replace(/\\/g, '/');
        return relativePath === 'lib/main.dart' ||
            relativePath.match(/lib\/main_.+\.dart$/) !== null;
    });

    // 참조된 모든 파일 수집
    for (const ref of references) {
        importedFilesAbsolute.add(ref.targetPath);

        // 소스 파일도 추가 (part of 관계에서 중요)
        if (ref.type === ReferenceType.PART_OF) {
            importedFilesAbsolute.add(ref.sourcePath);
        }
    }

    // 진입점 파일 추가
    for (const entry of entryPoints) {
        importedFilesAbsolute.add(entry);
    }

    // 유효한 파일만 필터링 (혹시 모를 잘못된 경로 제거)
    const validImportedFiles = new Set<string>();
    for (const file of importedFilesAbsolute) {
        if (allFilesAbsolute.includes(file)) {
            validImportedFiles.add(file);
        }
    }

    return validImportedFiles; // 절대 경로 Set 반환
}

/**
 * 프로젝트 내 모든 파일에서 모든 참조 정보를 수집합니다.
 */
function collectAllReferences(workspacePath: string, allFilesAbsolute: string[]): FileReference[] {
    let allReferences: FileReference[] = [];

    for (const filePath of allFilesAbsolute) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // 다양한 참조 유형 수집 및 병합
            allReferences = allReferences.concat(
                collectImportReferences(filePath, content, workspacePath),
                collectExportReferences(filePath, content),
                collectPartReferences(filePath, content),
                collectPartOfReferences(filePath, content),
                collectLibraryReferences(filePath, content)
            );
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
        }
    }

    return allReferences;
}

/**
 * import 참조를 수집합니다.
 * @returns 해당 파일에서 찾은 FileReference 배열
 */
function collectImportReferences(
    filePath: string,
    content: string,
    workspacePath: string
): FileReference[] {
    const references: FileReference[] = [];
    const regex = /import\s+['"]([^'"]+)['"];/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const importPath = match[1];

        // dart: 로 시작하는 내장 패키지는 제외
        if (importPath.startsWith('dart:')) {
            continue;
        }

        let candidatePath = '';
        const sourceDir = path.dirname(filePath);

        // 1. package: 경로 처리
        if (importPath.startsWith('package:')) {
            // 패키지 이름 추출 (package: 다음, / 이전까지)
            const packageName = importPath.substring(8, importPath.indexOf('/', 8));

            // 프로젝트 이름 추출 (워크스페이스 경로에서)
            const projectName = path.basename(workspacePath).replace(/-/g, '_');

            // 외부 패키지는 무시
            if (packageName !== projectName) {
                continue;
            }

            // 자체 패키지 경로 처리
            const pathAfterPackage = importPath.substring(importPath.indexOf('/') + 1);
            candidatePath = path.resolve(workspacePath, 'lib', pathAfterPackage);
        }
        // 2. 상대 경로 또는 파일명만 있는 경우 (모두 소스 디렉토리 기준으로 처리)
        else {
            candidatePath = path.resolve(sourceDir, importPath);
        }

        // 파일 존재 여부 확인 및 참조 추가
        const fileExists = fs.existsSync(candidatePath);

        if (candidatePath && fileExists) {
            references.push({
                type: ReferenceType.IMPORT,
                targetPath: candidatePath,
                sourcePath: filePath
            });
        }
    }

    return references;
}

/**
 * export 참조를 수집합니다.
 * @returns 해당 파일에서 찾은 FileReference 배열
 */
function collectExportReferences(
    filePath: string,
    content: string
): FileReference[] {
    const references: FileReference[] = [];
    const regex = /export\s+['"]([^'"]+)['"];/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const exportPath = match[1];

        // 상대 경로 처리 (현재 파일 디렉토리 기준)
        // - 명시적 상대 경로: ./global/global.dart, ../models/user.dart
        // - 암시적 상대 경로: global/global.dart (./이 생략된 형태)
        const sourceDir = path.dirname(filePath);
        const candidatePath = path.resolve(sourceDir, exportPath);

        // 파일 존재 여부 확인 및 참조 추가
        if (fs.existsSync(candidatePath)) {
            references.push({
                type: ReferenceType.EXPORT,
                targetPath: candidatePath,
                sourcePath: filePath
            });
        }
    }

    return references;
}

/**
 * part 참조를 수집합니다.
 * @returns 해당 파일에서 찾은 FileReference 배열
 */
function collectPartReferences(
    filePath: string,
    content: string
): FileReference[] {
    const references: FileReference[] = [];
    const regex = /part\s+['"]([^'"]+)['"];/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const partPath = match[1];

        // 상대 경로 처리 (현재 파일 디렉토리 기준)
        // - 명시적 상대 경로: ./part_file.dart, ../models/part_file.dart
        // - 암시적 상대 경로: part_file.dart (./이 생략된 형태)
        const sourceDir = path.dirname(filePath);
        const candidatePath = path.resolve(sourceDir, partPath);

        // 파일 존재 여부 확인 및 참조 추가
        if (fs.existsSync(candidatePath)) {
            // part 관계에서는 현재 파일이 라이브러리이고, part 파일이 타겟
            // 즉, part 파일은 현재 라이브러리 파일에 포함되어 사용됨
            references.push({
                type: ReferenceType.PART,
                targetPath: candidatePath, // part 파일 경로
                sourcePath: filePath      // 현재 라이브러리 파일 경로
            });
        }
    }

    return references;
}

/**
 * part of 참조를 수집합니다.
 * @returns 해당 파일에서 찾은 FileReference 배열
 */
function collectPartOfReferences(
    filePath: string,
    content: string
): FileReference[] {
    const references: FileReference[] = [];
    const regex = /part\s+of\s+['"]([^'"]+)['"];/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const libraryPath = match[1];

        // 상대 경로 처리 (현재 파일 디렉토리 기준)
        // - 명시적 상대 경로: ./library.dart, ../models/library.dart
        // - 암시적 상대 경로: library.dart (./이 생략된 형태)
        const sourceDir = path.dirname(filePath);
        const candidatePath = path.resolve(sourceDir, libraryPath);

        // 파일 존재 여부 확인 및 참조 추가
        if (fs.existsSync(candidatePath)) {
            // part of 관계에서는 현재 파일이 소스이고, 라이브러리 파일이 타겟
            // 즉, 현재 파일은 라이브러리 파일의 일부로 사용됨
            references.push({
                type: ReferenceType.PART_OF,
                targetPath: candidatePath, // 라이브러리 파일 경로
                sourcePath: filePath      // 현재 파일 경로
            });
        }
    }

    return references;
}

/**
 * library 선언을 수집합니다.
 * library 구문은 실제 파일을 참조하지 않고, 현재 파일에 이름을 부여합니다.
 * @returns 현재 파일을 자기 자신 참조로 갖는 FileReference 배열
 */
function collectLibraryReferences(
    filePath: string,
    content: string
): FileReference[] {
    const references: FileReference[] = [];
    const regex = /library\s+([^;]+);/g;

    // library 선언이 있으면 현재 파일을 참조된 파일로 간주
    if (regex.test(content)) {
        // library 구문은 파일 참조가 아니라 이름 선언이지만,
        // 파일이 사용되고 있음을 나타내기 위해 자기 자신을 참조로 추가
        references.push({
            type: ReferenceType.LIBRARY,
            targetPath: filePath,  // 자기 자신을 타겟으로
            sourcePath: filePath   // 자기 자신을 소스로
        });
    }

    return references;
}