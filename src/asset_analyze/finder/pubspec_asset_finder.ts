import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { collectFiles } from '../../utils/file_utils';

/**
 * pubspec.yaml 에 정의된 모든 asset 들의 상대 경로를 추출한다.
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
  const pubspecPath = path.join(workspacePath, 'pubspec.yaml');

  if (!fs.existsSync(pubspecPath)) {
    console.warn(`pubspec.yaml not found at: ${pubspecPath}`);
    return [];
  }

  // YAML 파일 읽기 및 파싱
  const content = fs.readFileSync(pubspecPath, 'utf8');
  const doc = yaml.parse(content);

  if (!doc.flutter?.assets || !Array.isArray(doc.flutter.assets)) {
    return [];
  }

  // 모든 절대 경로를 수집
  const absolutePaths: string[] = [];

  for (const asset of doc.flutter.assets) {
    if (typeof asset !== 'string') {
      continue;
    }

    // asset의 전체 경로 생성
    const assetPath = path.join(workspacePath, asset);

    if (!fs.existsSync(assetPath)) {
      console.warn(`Asset path does not exist: ${assetPath}`);
      continue;
    }

    const stat = fs.statSync(assetPath);

    if (stat.isDirectory()) {
      // 디렉토리인 경우 모든 하위 파일의 절대 경로 수집
      const files = collectFiles(assetPath);
      absolutePaths.push(...files);
    } else {
      // 단일 파일인 경우 절대 경로 추가
      absolutePaths.push(assetPath);
    }
  }

  // 절대 경로를 상대 경로로 변환하여 반환
  return absolutePaths.map(absPath =>
    path.relative(workspacePath, absPath).replace(/\\/g, '/')
  );
}
