import { findPubspecAssets } from './finder/pubspec_asset_finder';
import { findAssetsInStringLiterals } from './finder/string_referenced_asset_finder';
import { findStaticAssetReferences } from './finder/static_asset_reference_finder';
import { findStaticAssetVariables } from './finder/static_asset_variable_finder';

/**
 * 에셋 분석 결과를 나타내는 인터페이스
 */
export interface AssetAnalyzeResult {
    allAssets: string[];
    usedAssets: Set<string>;
    unusedAssets: string[];
}

/**
 * 프로젝트 내의 모든 에셋 사용 현황을 분석합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns 전체 에셋, 사용중인 에셋, 미사용 에셋 목록
 */
export function analyzeAssetUsage(workspacePath: string): AssetAnalyzeResult {
    // 1. 모든 에셋 가져오기
    const allAssets = findPubspecAssets(workspacePath);

    // 2. 사용중인 에셋 분석
    const usedAssets = findUsedAssets(workspacePath, allAssets);

    // 3. 미사용 에셋 계산
    const unusedAssets = allAssets.filter(asset => !usedAssets.has(asset));

    return {
        allAssets,
        usedAssets,
        unusedAssets
    };
}

/**
 * 프로젝트에서 사용중인 모든 에셋을 찾습니다.
 * (직접 참조 및 정적 변수를 통한 간접 참조 모두 포함)
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @param allAssets 프로젝트의 모든 에셋 목록
 * @returns 사용중인 에셋 집합
 */
function findUsedAssets(workspacePath: string, allAssets: string[]): Set<string> {
    // 1. 직접 참조 분석 (예: Image.asset('assets/images/logo.png'))
    const directlyUsedAssets = findAssetsInStringLiterals(workspacePath, allAssets);

    // 2. 정적 변수 참조 분석
    const {
        usedStaticAssets,
        unusedStaticAssets
    } = findStaticVariableAssets(workspacePath);

    // 3. 직접 참조 중 미사용 정적 변수와 중복되는 것 제외
    const trulyDirectlyUsedAssets = [...directlyUsedAssets].filter(
        asset => !unusedStaticAssets.includes(asset)
    );

    // 4. 최종 사용 에셋 = 순수 직접 참조 + 사용된 정적 변수 참조
    return new Set([
        ...trulyDirectlyUsedAssets,
        ...usedStaticAssets
    ]);
}

/**
 * 정적 변수를 통한 에셋 참조 사용 여부를 분석합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns 사용/미사용 정적 변수 에셋 경로
 */
function findStaticVariableAssets(workspacePath: string) {
    // 1. 정적 변수로 정의된 에셋 참조 찾기
    const staticReferences = findStaticAssetReferences(workspacePath);

    // 2. 정적 변수가 실제로 사용되는지 확인
    const usedStaticVars = findStaticAssetVariables(workspacePath, staticReferences);

    // 3. 사용된 정적 변수를 통해 참조된 에셋
    const usedStaticAssets = staticReferences
        .filter(ref => usedStaticVars.has(`${ref.className}.${ref.variableName}`))
        .map(ref => ref.assetPath);

    // 4. 정의는 됐지만 사용되지 않는 정적 에셋
    const unusedStaticAssets = staticReferences
        .filter(ref => !usedStaticVars.has(`${ref.className}.${ref.variableName}`))
        .map(ref => ref.assetPath);

    return { usedStaticAssets, unusedStaticAssets };
}

