import * as fs from 'fs';
import * as path from 'path';
import { StaticAssetReference } from './static_asset_reference_finder';
import { collectDartFiles } from '../../../utils/file_utils';

/**
 * 정적 에셋 참조가 실제로 다른 파일에서 사용되는지 확인한다.
 * 
 * @example
 * // 정의된 파일 (예: asset_paths.dart):
 * class AssetPaths {
 *   static const logo = 'assets/images/logo.png';
 * }
 * 
 * // 다른 파일에서 사용 (예: home_screen.dart):
 * Image.asset(AssetPaths.logo)  // ✅ 사용됨으로 카운트
 * 
 * // 정의된 파일에서 사용:
 * print(AssetPaths.logo)        // ❌ 정의된 파일 내 사용은 무시
 * 
 * @description
 * 1. 각 정적 변수가 정의된 파일을 찾아서 매핑
 * 2. 모든 Dart 파일을 순회하면서:
 *    - 정의된 파일이 아닌 곳에서
 *    - className.variableName 형태로 참조되는 변수를 찾음
 * 3. 발견된 사용 중인 변수들의 집합을 반환
 * 
 * @param workspacePath 프로젝트 루트 디렉토리 경로
 * @param references static_asset_reference_finder에서 찾은 정적 에셋 참조들
 * @returns 실제 사용 중인 변수들의 집합 (형식: "className.variableName")
 */
export function findStaticAssetVariables(
  workspacePath: string,
  references: StaticAssetReference[]
): Set<string> {
  const libDir = path.join(workspacePath, 'lib');
  const dartFiles = collectDartFiles(libDir);
  const usedVariableKeys = new Set<string>();

  // 각 정적 변수가 어느 파일에 정의되어 있는지 매핑
  // key: "AssetPaths.logo", value: "/project/lib/asset_paths.dart"
  const definitionMap = new Map<string, string>();
  for (const ref of references) {
    const key = `${ref.className}.${ref.variableName}`;
    // reference 에 대해 정의된 파일을 찾는다.
    const definingFile = findDefinedFileOfStaticVariable(dartFiles, ref.className, ref.variableName);

    if (definingFile) {
      definitionMap.set(key, definingFile);
    }
  }

  // 각 Dart 파일에서 정적 변수 사용 검사
  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const ref of references) {
      const key = `${ref.className}.${ref.variableName}`;
      const definingFile = definitionMap.get(key);

      // 정의된 파일이 없거나, 정의된 파일 내부라면 스킵
      if (!definingFile || file === definingFile) {
        continue;
      }

      // className.variableName 형태로 사용되는지 확인
      if (content.includes(key)) {
        usedVariableKeys.add(key);
      }
    }
  }

  return usedVariableKeys;
}

/**
 * 주어진 정적 변수가 정의된 파일을 찾는다.
 * 
 * @example
 * // 찾고자 하는 정의:
 * class AssetPaths {        // className
 *   static const logo = ... // variableName
 * }
 * 
 * @param files 검색할 Dart 파일 경로들
 * @param className 찾을 클래스 이름
 * @param variableName 찾을 변수 이름
 * @returns 변수가 정의된 파일 경로 또는 null
 */
function findDefinedFileOfStaticVariable(
  files: string[],
  className: string,
  variableName: string
): string | null {
  // 클래스 내에서 static const 변수 정의를 찾는 정규식
  const regex = new RegExp(
    `class\\s+${className}[\\s\\S]*?static\\s+const(?:\\s+\\w+)?\\s+${variableName}\\s*=`,
    'm'
  );

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) {
      return file;
    }
  }

  return null;
}
