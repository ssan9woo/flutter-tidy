// src/utils/static_variable_usage_tracker.ts

import * as fs from 'fs';
import * as path from 'path';
import { StaticAssetReference } from './static_asset_parser';

/**
 * 
 * 정의된 파일 제외하고, 다른 파일에서 사용된 적 있는 references 찾기
 */
export function findUsedStaticVariables(
  workspacePath: string,
  references: StaticAssetReference[]
): Set<string> {
  const libDir = path.join(workspacePath, 'lib');
  const dartFiles = collectDartFiles(libDir);
  const usedVariableKeys = new Set<string>();

  // 정리: className.variableName → 정의된 파일 경로
  const definitionMap = new Map<string, string>();
  for (const ref of references) {
    const key = `${ref.className}.${ref.variableName}`;
    const definingFile = findFileDefiningVariable(dartFiles, ref.className, ref.variableName);
    if (definingFile) {
      definitionMap.set(key, definingFile);
    }
  }

  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const ref of references) {
      const key = `${ref.className}.${ref.variableName}`;
      const definingFile = definitionMap.get(key);
      if (!definingFile || file === definingFile) continue;

      if (content.includes(key)) {
        usedVariableKeys.add(key);
      }
    }
  }

  return usedVariableKeys;
}

function collectDartFiles(dir: string): string[] {
  let results: string[] = [];

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(collectDartFiles(fullPath));
    } else if (entry.endsWith('.dart')) {
      results.push(fullPath);
    }
  }

  return results;
}

function findFileDefiningVariable(
  files: string[],
  className: string,
  variableName: string
): string | null {
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
