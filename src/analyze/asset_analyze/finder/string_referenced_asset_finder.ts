import * as fs from 'fs';
import * as path from 'path';
import { collectDartFiles } from '../../../utils/file_utils';

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
 * 4. 발견된 asset 경로들을 Set으로 반환
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @param assetPaths 확인할 asset 경로 목록 (pubspec.yaml에서 추출된 경로들)
 * @returns 직접 사용된 asset 경로들의 집합
 */
export function findAssetsInStringLiterals(workspacePath: string, assetPaths: string[]): Set<string> {
  // lib 디렉토리 전체 경로
  // 예: "/Users/project/lib"
  const libDir = path.join(workspacePath, 'lib');
  const usedAssets = new Set<string>();

  // lib 디렉토리 내의 모든 Dart 파일 수집
  // dartFiles 예시: [
  //   "/Users/project/lib/main.dart",
  //   "/Users/project/lib/screens/home.dart"
  // ]
  const dartFiles = collectDartFiles(libDir);

  for (const file of dartFiles) {
    // 각 Dart 파일의 내용을 문자열로 읽음
    const content = fs.readFileSync(file, 'utf8');

    // 각 asset 경로에 대해
    for (const assetAbsPath of assetPaths) {
      // 파일 내용에 asset 경로가 포함되어 있는지 확인
      // 단순 문자열 포함 여부로 체크 (TODO: 개선 필요)
      const found = content.includes(assetAbsPath);

      if (found) {
        usedAssets.add(assetAbsPath);
      }
    }
  }

  // 최종 반환값 예시:
  // Set {
  //   "assets/images/logo.png",
  //   "assets/icons/home.png"
  // }
  return usedAssets;
}