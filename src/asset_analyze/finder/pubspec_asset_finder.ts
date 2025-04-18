import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { collectFiles } from '../../utils/file_utils';

/**
 * pubspec.yaml 에 정의된 모든 asset 들을 추출한다.
 * 
 * @example
 * // workspacePath: "/Users/project"
 * // pubspec.yaml 내용:
 * // flutter:
 * //   assets:
 * //     - assets/images/   # 디렉토리
 * //     - assets/logo.png  # 단일 파일
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @returns Flutter 프로젝트에서 사용 가능한 모든 asset 파일의 상대 경로 목록
 */
export function findPubspecAssets(workspacePath: string): string[] {
  // pubspec.yaml 전체 경로 생성
  // 예: "/Users/project/pubspec.yaml"
  const pubspecPath = path.join(workspacePath, 'pubspec.yaml');

  if (!fs.existsSync(pubspecPath)) {
    console.warn(`pubspec.yaml not found at: ${pubspecPath}`);
    return [];
  }

  // YAML 파일 읽기 및 파싱
  // doc.flutter.assets 예시: ['assets/images/', 'assets/logo.png']
  const content = fs.readFileSync(pubspecPath, 'utf8');
  const doc = yaml.parse(content);

  if (!doc.flutter?.assets || !Array.isArray(doc.flutter.assets)) {
    return [];
  }

  const assets: string[] = [];

  for (const asset of doc.flutter.assets) {
    if (typeof asset !== 'string') {
      continue;
    }

    // asset의 전체 경로 생성
    // 예1: "/Users/project/assets/images/"      (디렉토리)
    // 예2: "/Users/project/assets/logo.png"     (파일)
    const assetPath = path.join(workspacePath, asset);

    if (!fs.existsSync(assetPath)) {
      console.warn(`Asset path does not exist: ${assetPath}`);
      continue;
    }

    const stat = fs.statSync(assetPath);

    if (stat.isDirectory()) {
      // 디렉토리인 경우 모든 하위 파일 수집
      // files: [
      //   "/Users/project/assets/images/photo1.png",
      //   "/Users/project/assets/images/photo2.png"
      // ]
      const files = collectFiles(assetPath);

      // 절대 경로를 상대 경로로 변환 (Flutter 스타일)
      // relativeFiles: [
      //   "assets/images/photo1.png",
      //   "assets/images/photo2.png"
      // ]
      const relativeFiles = files.map(file =>
        path.relative(workspacePath, file).replace(/\\/g, '/')
      );
      assets.push(...relativeFiles);
    } else {
      // 단일 파일인 경우 상대 경로로 변환
      // relative: "assets/logo.png"
      const relative = path.relative(workspacePath, assetPath).replace(/\\/g, '/');
      assets.push(relative);
    }
  }

  // 최종 반환값: [
  //   "assets/images/photo1.png",
  //   "assets/images/photo2.png",
  //   "assets/logo.png"
  // ]
  return assets;
}
