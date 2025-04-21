/**
 * 의존성 분석 결과
 */
export interface DependencyAnalysis {
    /** 모든 의존성 목록 */
    all: string[];
    /** 사용중인 의존성 집합 */
    used: Set<string>;
    /** 미사용 의존성 목록 */
    unused: string[];
}

/**
 * 패키지 의존성 분석 결과를 나타내는 인터페이스
 */
export interface PackageAnalyzeResult {
    /** 일반 의존성 결과 */
    generic: DependencyAnalysis;
    /** 개발 의존성 결과 */
    dev: DependencyAnalysis;
} 