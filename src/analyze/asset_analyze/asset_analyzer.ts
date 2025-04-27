import { findPubspecAssets } from './finder/pubspec_asset_finder';
import { findGenericAssetReferences } from './finder/generic_asset_reference_finder';
import { findStaticAssetReferences } from './finder/static_asset_reference_finder';
import { AssetAnalyzeResult } from './models/asset_analyze_models';

/**
 * 프로젝트 내의 모든 에셋 사용 현황을 분석합니다.
 * 
 * @param workspacePath 프로젝트 루트 경로
 * @returns 전체 에셋, 사용중인 에셋, 미사용 에셋 목록
 */
export function analyzeAssetUsage(workspacePath: string): AssetAnalyzeResult {
    const result: AssetAnalyzeResult = {
        allAssets: [],
        usedAssets: [],
        unusedAssets: []
    }

    const allAssets = findPubspecAssets(workspacePath);

    const genericAssetReferences = findGenericAssetReferences(workspacePath, allAssets);

    const staticAssetReferences = findStaticAssetReferences(workspacePath);

    result.allAssets = allAssets;
    for (const ref of genericAssetReferences) {
        // 해당 asset이 특정 변수로 mapping되어 있다면
        const staticAssetReference = staticAssetReferences.find(staticRef => staticRef.assetPath === ref.assetPath);

        // asset ref와 맵핑된 static asset ref가 있으면
        if (staticAssetReference) {
            // 직, 간접적으로 사용하는 asset들이 정의된 파일 외에 참조하고 있는 곳이 있다면, 사용하는 것으로 판별
            if (staticAssetReference.usedFilePaths.length > 1 || ref.referredFilePaths.length > 1) {
                result.usedAssets.push(ref.assetPath);
            } else {
                result.unusedAssets.push(ref.assetPath);
            }
        } else {
            // 특정 변수에 mapping되지 않는다면, 이미 generic asset ref에서 사용중으로 판별
            result.usedAssets.push(ref.assetPath);
        }
    }

    return result;
}

