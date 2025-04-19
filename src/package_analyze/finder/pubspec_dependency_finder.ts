import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * pubspec.yaml에서 추출한 의존성 정보
 */
export interface PubspecDependencies {
    /** 일반 의존성 목록 */
    genericDependencies: string[];
    /** 개발 의존성 목록 */
    devDependencies: string[];
}

/**
 * pubspec.yaml에 정의된 모든 의존성 패키지를 추출합니다.
 * 
 * @example
 * // pubspec.yaml 내용:
 * // dependencies:
 * //   flutter:
 * //     sdk: flutter
 * //   http: ^0.13.3
 * //   provider: ^6.0.0
 * // dev_dependencies:
 * //   flutter_test:
 * //     sdk: flutter
 * //   build_runner: ^2.1.2
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @returns 일반 의존성과 개발 의존성으로 분리된 패키지 목록
 */
export function findPubspecDependencies(workspacePath: string): PubspecDependencies {
    // pubspec.yaml 전체 경로 생성
    const pubspecPath = path.join(workspacePath, 'pubspec.yaml');

    if (!fs.existsSync(pubspecPath)) {
        console.warn(`pubspec.yaml not found at: ${pubspecPath}`);
        return { genericDependencies: [], devDependencies: [] };
    }

    // YAML 파일 읽기 및 파싱
    const content = fs.readFileSync(pubspecPath, 'utf8');
    const doc = yaml.parse(content);

    // 일반 의존성 패키지 추출
    const genericDependencies: string[] = [];
    if (doc.dependencies && typeof doc.dependencies === 'object') {
        genericDependencies.push(...extractDependencyNames(doc.dependencies));
    }

    // 개발용 의존성 패키지 추출
    const devDependencies: string[] = [];
    if (doc.dev_dependencies && typeof doc.dev_dependencies === 'object') {
        devDependencies.push(...extractDependencyNames(doc.dev_dependencies));
    }

    // 예외 패키지 필터링
    return {
        genericDependencies: filterExceptionPackages(genericDependencies),
        devDependencies: filterExceptionPackages(devDependencies),
    };
}

/**
 * 의존성 객체에서 패키지 이름만 추출합니다.
 * 
 * @param dependencies 의존성 객체
 * @returns 패키지 이름 목록
 */
function extractDependencyNames(dependencies: Record<string, any>): string[] {
    return Object.keys(dependencies).filter(name => name.trim() !== '');
}

/**
 * 확인이 필요없는 예외 패키지를 필터링합니다.
 * 
 * @param dependencies 전체 의존성 패키지 목록
 * @returns 필터링된 의존성 패키지 목록
 */
function filterExceptionPackages(dependencies: string[]): string[] {
    // 확인이 필요 없는 패키지 목록
    const exceptionPackages = [
        'flutter',          // Flutter SDK
        'flutter_test',     // Flutter 테스트 SDK
        'flutter_lints',    // 린트 규칙
        'flutter_localizations', // 기본 로컬라이제이션
    ];

    return dependencies.filter(dep => !exceptionPackages.includes(dep));
} 