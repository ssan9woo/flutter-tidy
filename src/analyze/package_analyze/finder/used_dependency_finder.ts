import * as fs from 'fs';
import * as path from 'path';
import { collectDartFiles, collectFilesByExtension } from '../../../utils/file_utils';

/**
 * 프로젝트 소스 코드에서 사용중인 패키지 의존성을 찾습니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param allDependencies pubspec.yaml에 선언된 모든 의존성 목록
 * @returns 코드에서 사용중인 패키지 의존성 집합
 */
export function findUsedDependencies(workspacePath: string, allDependencies: string[]): Set<string> {
    const usedDependencies = new Set<string>();
    const sourceFiles = findDartFiles(workspacePath);

    // 모든 소스 파일에서 import 문 분석
    for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');

        // 각 의존성에 대해 사용 여부 확인
        for (const dependency of allDependencies) {
            if (isDependencyUsed(content, dependency)) {
                usedDependencies.add(dependency);
            }
        }
    }

    return usedDependencies;
}

/**
 * 프로젝트 내의 모든 Dart 파일을 찾습니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns Dart 파일 경로 목록
 */
function findDartFiles(workspacePath: string): string[] {
    // 일반 lib 디렉토리의 Dart 파일
    const libFiles = collectDartFiles(path.join(workspacePath, 'lib'));

    // test 디렉토리의 Dart 파일
    const testFiles = collectDartFiles(path.join(workspacePath, 'test'));

    // integration_test 디렉토리의 Dart 파일 (통합 테스트)
    const integrationTestFiles = collectDartFiles(path.join(workspacePath, 'integration_test'));

    // 루트 디렉토리의 Dart 파일 (main.dart 등)
    const rootFiles = collectFilesByExtension(workspacePath, '.dart', [
        'lib', 'test', 'integration_test', 'build', 'ios', 'android',
        'web', 'windows', 'macos', 'linux', '.dart_tool', 'node_modules', '.git'
    ]);

    return [
        ...libFiles,
        ...testFiles,
        ...integrationTestFiles,
        ...rootFiles
    ];
}

/**
 * 주어진 소스 코드 내용에서 특정 패키지 의존성이 사용되는지 확인합니다.
 * 
 * @param content Dart 파일 내용
 * @param dependency 확인할 패키지 이름
 * @returns 패키지 사용 여부
 */
function isDependencyUsed(content: string, dependency: string): boolean {
    // Dart의 import 패턴
    // 패키지 import: import 'package:패키지_이름/...
    const packagePattern = new RegExp(`import\\s+['\"]package:${dependency}/.*?['\"]`, 'gm');

    // 특수한 패키지 처리 (예: firebase_core)
    if (dependency.includes('_')) {
        const packageParts = dependency.split('_');

        // firebase_core와 같은 패키지는 firebase.dart 파일을 포함할 수 있음
        for (let i = 1; i < packageParts.length; i++) {
            const parentPackage = packageParts.slice(0, i).join('_');
            const childPackage = packageParts.slice(i).join('_');

            const altPattern = new RegExp(`import\\s+['\"]package:${parentPackage}/${childPackage}\\.dart['\"]`, 'gm');

            if (altPattern.test(content)) {
                return true;
            }
        }
    }

    return packagePattern.test(content);
}
