import { findPubspecDependencies } from "./finder/pubspec_dependency_finder";
import { findUsedDependencies } from "./finder/used_dependency_finder";
import { findGenericDependencyUsage } from "./finder/generic_dependency_usage_finder";
import { findDevDependencyUsage } from "./finder/dev_dependency_usage_finder";
import { DependencyAnalysis, PackageAnalyzeResult } from "./models/dependency_models";

/**
 * 프로젝트 내의 모든 패키지 의존성 사용 현황을 분석합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns 전체 의존성, 사용중인 의존성, 미사용 의존성 목록
 */
export function analyzePackageUsage(workspacePath: string): PackageAnalyzeResult {
    // 1. pubspec.yaml에서 모든 의존성 가져오기 (일반/개발 의존성 분리)
    const { genericDependencies, devDependencies } = findPubspecDependencies(workspacePath);

    // 2. 코드(lib, test 등)에서 사용중인 모든 의존성 분석
    const allUsedDependencies = findUsedDependencies(
        workspacePath,
        [...genericDependencies, ...devDependencies]
    );

    // 3. 일반 의존성 사용 여부 분석
    const { used: usedGenericDeps, unused: unusedGenericDeps } = findGenericDependencyUsage(
        genericDependencies,
        allUsedDependencies
    );

    // 4. 개발 의존성 사용 여부 분석
    const { used: usedDevDeps, unused: unusedDevDeps } = findDevDependencyUsage(
        devDependencies,
        allUsedDependencies
    );

    // 5. 최종 분석 결과 조합
    return {
        generic: {
            all: genericDependencies,
            used: usedGenericDeps,
            unused: unusedGenericDeps
        },
        dev: {
            all: devDependencies,
            used: usedDevDeps,
            unused: unusedDevDeps
        }
    };
} 