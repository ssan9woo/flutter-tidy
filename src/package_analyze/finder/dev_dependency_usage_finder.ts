/**
 * 개발 의존성의 사용 여부를 확인하는 유틸리티 함수
 */

/**
 * 개발 의존성 중 사용되는 의존성과 미사용 의존성을 찾아냅니다.
 * 현재는 코드에서 직접 import된 것만 확인하지만,
 * 향후 개발 의존성 특성에 맞는 추가 감지 로직을 구현할 수 있습니다.
 * 
 * @param devDependencies 프로젝트의 모든 개발 의존성 목록
 * @param allUsedDependencies 코드에서 감지된 사용 중인 모든 의존성 set
 * @returns 사용 중인 의존성과 미사용 의존성으로 구분된 결과
 */
export function findDevDependencyUsage(
    devDependencies: string[],
    allUsedDependencies: Set<string>
): {
    used: Set<string>;
    unused: string[];
} {
    // 현재는 일반 의존성과 동일한 방식으로 처리 (코드 내 import만 확인)
    // 향후 이 부분에 개발 도구 특화 감지 로직 추가 가능
    const usedDeps = new Set<string>();
    for (const dep of devDependencies) {
        if (allUsedDependencies.has(dep)) {
            usedDeps.add(dep);
        }
    }

    // 미사용 의존성 계산
    const unusedDeps = devDependencies.filter(
        (dep: string) => !usedDeps.has(dep)
    );

    return {
        used: usedDeps,
        unused: unusedDeps
    };
}

// 향후 확장 가능한 개발 의존성 감지 기능:
// 1. 빌드 도구, 코드 생성기 감지
// 2. 설정 파일 기반 사용 패턴
// 3. pubspec.yaml 내 설정 관련 패턴
// 4. 테스트 관련 패키지 