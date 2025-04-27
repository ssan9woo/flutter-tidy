import * as fs from 'fs';
import * as path from 'path';
import { collectDartFiles } from '../../../utils/file_utils';
import { StaticAssetReferenceInfo } from '../models/asset_analyze_models';

/**
 * Dart 클래스 내의 정적 에셋 참조 정보
 * 
 * @example
 * class Assets {
 *         ^      
 *     className
 *   static const String logo = 'assets/images/logo.png';
 *                        ^                ^
 *                  variableName       assetPath
 * }
 */


/**
 * Dart 코드에서 정적으로 선언된 에셋 참조들을 추출한다.
 * 
 * @example
 * // Dart 코드 예시:
 * class AssetPaths {
 *   static const logo = 'assets/images/logo.png';
 *   static const String icon = 'assets/icons/app_icon.png';
 * }
 * 
 * // 추출 결과:
 * [
 *   { className: 'AssetPaths', variableName: 'logo', assetPath: 'assets/images/logo.png', definedFilePath: '/path/to/asset_paths.dart' },
 *   { className: 'AssetPaths', variableName: 'icon', assetPath: 'assets/icons/app_icon.png', definedFilePath: '/path/to/asset_paths.dart' }
 * ]
 * 
 * @description
 * 1. lib 디렉토리 내의 모든 Dart 파일을 수집
 * 2. 모든 파일을 한 번만 읽어 파일 내용을 캐싱
 * 3. 정적 변수 정의와 사용을 한 번에 검사
 * 4. 결과 객체 반환
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @returns 발견된 모든 정적 에셋 참조 정보 배열
 */
export function findStaticAssetReferences(workspacePath: string): StaticAssetReferenceInfo[] {
  const libDir = path.join(workspacePath, 'lib');
  const dartFiles = collectDartFiles(libDir);

  // 파일 내용 캐싱 (파일 경로 -> 내용)
  const fileContents = new Map<string, string>();
  // 정적 변수 참조 맵 (className.varName -> 참조 객체)
  const referenceMap = new Map<string, StaticAssetReferenceInfo>();

  // 모든 파일 내용을 한 번만 읽어서 캐싱
  dartFiles.forEach(file => {
    fileContents.set(file, fs.readFileSync(file, 'utf8'));
  });

  // 1단계: 정적 변수 정의 찾기
  // 클래스 정의 정규식 (한 번만 컴파일)
  const classRegex = /class\s+(\w+)\s*{([\s\S]*?)}/g;
  // 정적 변수 정의 정규식 (한 번만 컴파일)
  const constRegex = /static\s+const(?:\s+\w+)?\s+(\w+)\s*=\s*['"](.+?)['"]/g;

  fileContents.forEach((content, file) => {
    let classMatch;
    classRegex.lastIndex = 0; // 정규식 인덱스 초기화

    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];

      constRegex.lastIndex = 0; // 정규식 인덱스 초기화
      let constMatch;

      while ((constMatch = constRegex.exec(classBody)) !== null) {
        const variableName = constMatch[1];
        const assetPath = constMatch[2];

        // assets/ 로 시작하는 경로만 수집
        if (assetPath.startsWith('assets/')) {
          const key = `${className}.${variableName}`;
          referenceMap.set(key, {
            className,
            variableName,
            assetPath,
            definedFilePath: file,
            usedFilePaths: [file] // 정의 파일은 기본적으로 추가
          });
        }
      }
    }
  });

  // 2단계: 정적 변수 사용 위치 찾기
  fileContents.forEach((content, file) => {
    // 각 참조에 대해 현재 파일에서 사용되는지 확인
    referenceMap.forEach((ref, key) => {
      // 정의 파일은 이미 처리됨
      if (file !== ref.definedFilePath && content.includes(key)) {
        ref.usedFilePaths.push(file);
      }
    });
  });

  return Array.from(referenceMap.values());
}
