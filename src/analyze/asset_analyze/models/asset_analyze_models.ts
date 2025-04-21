/**
 * 에셋 분석 결과를 나타내는 인터페이스
 */
export interface AssetAnalyzeResult {
    /** 프로젝트의 모든 에셋 경로 목록 */
    allAssets: string[];
    /** 코드에서 사용되는 에셋 경로 집합 */
    usedAssets: Set<string>;
    /** 코드에서 사용되지 않는 에셋 경로 목록 */
    unusedAssets: string[];
}

/**
 * 정적 변수를 통한 에셋 참조 사용 분석 결과
 */
export interface StaticAssetResult {
    /** 정적 변수로 참조되며 실제 사용되는 에셋 경로 목록 */
    usedStaticAssets: string[];
    /** 정적 변수로 정의되었지만 사용되지 않는 에셋 경로 목록 */
    unusedStaticAssets: string[];
} 