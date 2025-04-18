// src/utils/static_asset_parser.ts

import * as fs from 'fs';
import * as path from 'path';

export interface StaticAssetReference {
  className: string;
  variableName: string;
  assetPath: string;
}

/**
 * 
 * assets 하위에 있는 모든 path 에 대해, 해당 path 를 갖는 static 변수들이 있는지 찾는다.
 */
export function extractStaticAssetReferences(workspacePath: string): StaticAssetReference[] {
  const libDir = path.join(workspacePath, 'lib');
  const dartFiles = collectDartFiles(libDir);
  const references: StaticAssetReference[] = [];

  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    const classRegex = /class\s+(\w+)\s*{([\s\S]*?)}/g;
    let classMatch: RegExpExecArray | null;

    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];

      const constRegex = /static\s+const(?:\s+\w+)?\s+(\w+)\s*=\s*['"](.+?)['"]/g;
      let constMatch: RegExpExecArray | null;

      while ((constMatch = constRegex.exec(classBody)) !== null) {
        const variableName = constMatch[1];
        const assetPath = constMatch[2];

        if (assetPath.startsWith('assets/')) {
          references.push({ className, variableName, assetPath });
        }
      }
    }
  }

  return references;
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
