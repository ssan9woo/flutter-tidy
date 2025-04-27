/**
 * 에셋 참조 정보를 추적하는 인터페이스
 */
export interface GenericAssetReferenceInfo {
    /** 에셋 경로 */
    assetPath: string;
    /** 에셋이 참조된 파일 경로 목록 */
    referredFilePaths: string[];
}

/**
 * 정적 변수 에셋 참조 정보를 확장한 인터페이스
 */
export interface StaticAssetReferenceInfo {
    /** 정적 변수가 정의된 클래스 명 */
    className: string;
    /** 정적 변수 이름 */
    variableName: string;
    /** 참조하는 에셋 경로 */
    assetPath: string;
    /** 정적 변수가 정의된 파일 경로 */
    definedFilePath: string;
    /** 정적 변수가 사용되는 파일 경로 목록 */
    usedFilePaths: string[];
}

/**
 * 에셋 분석 결과를 나타내는 인터페이스
 */
export interface AssetAnalyzeResult {
    /** 프로젝트의 모든 에셋 경로 목록 */
    allAssets: string[];
    /** 코드에서 사용되는 에셋 경로 집합 */
    usedAssets: string[];
    /** 코드에서 사용되지 않는 에셋 경로 목록 */
    unusedAssets: string[];
}


/**
 * 정적 변수를 통한 에셋 참조 사용 분석 결과
 */
export interface StaticAssetUsageResult {
    /** 정적 변수로 참조되며 실제 사용되는 에셋 경로 목록 */
    usedStaticAssets: string[];
    /** 정적 변수로 정의되었지만 사용되지 않는 에셋 경로 목록 */
    unusedStaticAssets: string[];
}