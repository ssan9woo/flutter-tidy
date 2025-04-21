import * as fs from 'fs';
import * as path from 'path';
import { collectDartFiles } from '../../../utils/file_utils';

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
export interface StaticAssetReference {
  /** 에셋을 정의하고 있는 클래스 이름 */
  className: string;
  /** 에셋 경로를 담고 있는 static const 변수 이름 */
  variableName: string;
  /** 실제 에셋 파일 경로 */
  assetPath: string;
}

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
 * class Images {
 *   static const background = 'assets/images/bg.jpg';
 * }
 * 
 * // 추출 결과:
 * [
 *   { className: 'AssetPaths', variableName: 'logo', assetPath: 'assets/images/logo.png' },
 *   { className: 'AssetPaths', variableName: 'icon', assetPath: 'assets/icons/app_icon.png' },
 *   { className: 'Images', variableName: 'background', assetPath: 'assets/images/bg.jpg' }
 * ]
 * 
 * @description
 * 1. lib 디렉토리 내의 모든 Dart 파일을 수집
 * 2. 각 파일에서 클래스 정의를 찾음
 * 3. 클래스 내부에서 'assets/'로 시작하는 경로를 가진 static const 변수를 찾음
 * 4. 발견된 모든 정적 에셋 참조 정보를 반환
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @returns 발견된 모든 정적 에셋 참조 정보 배열
 */
export function findStaticAssetReferences(workspacePath: string): StaticAssetReference[] {
  const libDir = path.join(workspacePath, 'lib');
  const dartFiles = collectDartFiles(libDir);
  const references: StaticAssetReference[] = [];

  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // 클래스 정의를 찾는 정규식
    // 예: class AssetPaths { ... }
    const classRegex = /class\s+(\w+)\s*{([\s\S]*?)}/g;
    let classMatch: RegExpExecArray | null;

    // file 내에 클래스 정의가 있는 경우 확인
    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];

      // static const 변수 선언을 찾는 정규식
      // 예: static const logo = 'assets/images/logo.png'
      // 예: static const String icon = 'assets/icons/app_icon.png'
      const constRegex = /static\s+const(?:\s+\w+)?\s+(\w+)\s*=\s*['"](.+?)['"]/g;
      let constMatch: RegExpExecArray | null;

      while ((constMatch = constRegex.exec(classBody)) !== null) {
        const variableName = constMatch[1];
        const assetPath = constMatch[2];

        // assets/ 로 시작하는 경로만 수집
        if (assetPath.startsWith('assets/')) {
          references.push({ className, variableName, assetPath });
        }
      }
    }
  }

  return references;
}
