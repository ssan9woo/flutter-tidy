import * as fs from 'fs';
import * as path from 'path';

/**
 * Codebase 내에서 직접 사용된 asset 들을 찾는다.
 *
 * asset에는 포함되지만, 실제로 코드에서 한 번도 사용되지 않는 asset들을 찾기 위함.
 */
export function findDirectlyUsedAssets(workspacePath: string, assetPaths: string[]): Set<string> {
  const libDir = path.join(workspacePath, 'lib');
  const usedAssets = new Set<string>();

  const dartFiles = collectDartFiles(libDir);

  for (const file of dartFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const assetAbsPath of assetPaths) {
      const relativePath = assetAbsPath;
      const found = content.includes(relativePath);

      if (found) {
        usedAssets.add(assetAbsPath);
      }
    }

  }

  return usedAssets;
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
