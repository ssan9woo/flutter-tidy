/**
 * 일반 의존성의 사용 여부를 확인하는 유틸리티 함수
 */

/**
 * 일반 의존성 중 사용되는 의존성과 미사용 의존성을 찾아냅니다.
 * 
 * @param genericDependencies 프로젝트의 모든 일반 의존성 목록
 * @param allUsedDependencies 코드에서 감지된 사용 중인 모든 의존성 set
 * @returns 사용 중인 의존성과 미사용 의존성으로 구분된 결과
 */
export function findGenericDependencyUsage(
    genericDependencies: string[],
    allUsedDependencies: Set<string>
): {
    used: Set<string>;
    unused: string[];
} {
    // 사용 중인 일반 의존성 필터링
    const usedDeps = new Set<string>();
    for (const dep of genericDependencies) {
        if (allUsedDependencies.has(dep)) {
            usedDeps.add(dep);
        }
    }

    // 미사용 의존성 계산
    const unusedDeps = genericDependencies.filter(
        (dep: string) => !usedDeps.has(dep)
    );

    return {
        used: usedDeps,
        unused: unusedDeps
    };
} 