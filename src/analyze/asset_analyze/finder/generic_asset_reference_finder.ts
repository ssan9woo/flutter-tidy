import * as fs from 'fs';
import * as path from 'path';
import { collectDartFiles } from '../../../utils/file_utils';
import { GenericAssetReferenceInfo } from '../models/asset_analyze_models';

/**
 * Codebase 내에서 직접 사용된 asset 들을 찾는다.
 *
 * @example
 * // workspacePath: "/Users/project"
 * // assetPaths: [
 * //   "assets/images/logo.png",
 * //   "assets/icons/home.png"
 * // ]
 * 
 * // Dart 파일 내용 예시:
 * // final logoPath = 'assets/images/logo.png';  // 직접 사용 - 발견됨
 * // const icon = 'assets/icons/settings.png';    // 목록에 없음 - 무시됨
 * 
 * @description
 * 1. lib 디렉토리 내의 모든 Dart 파일을 수집
 * 2. 각 파일의 내용을 문자열로 읽음
 * 3. assetPaths의 각 경로가 파일 내용에 포함되어 있는지 확인
 * 4. 발견된 asset 경로와 참조 파일 정보를 반환
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @param assetPaths 확인할 asset 경로 목록 (pubspec.yaml에서 추출된 경로들)
 * @returns 직접 사용된 asset 경로들과 참조 파일 정보
 */
export function findGenericAssetReferences(workspacePath: string, assetPaths: string[]): GenericAssetReferenceInfo[] {
  const libDir = path.join(workspacePath, 'lib');
  const assetReferences = new Map<string, string[]>();
  const dartFiles = collectDartFiles(libDir);

  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const assetPath of assetPaths) {
      // 파일 내용에 asset 경로가 포함되어 있는지 확인
      const found = content.includes(assetPath);

      if (found) {
        const referredFiles = assetReferences.get(assetPath) || [];
        referredFiles.push(file);
        assetReferences.set(assetPath, referredFiles);
      }
    }
  }

  const result: GenericAssetReferenceInfo[] = [];
  assetReferences.forEach((referredFilePaths, assetPath) => {
    result.push({
      assetPath,
      referredFilePaths
    });
  });

  return result;
}