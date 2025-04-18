import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * pubspec.yaml 에 정의된 모든 asset 들을 추출한다.
 */
export function extractAssetsFromPubspec(workspacePath: string): string[] {
  const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
  const content = fs.readFileSync(pubspecPath, 'utf8');
  const doc = yaml.parse(content);

  const assets: string[] = [];

  if (doc.flutter && Array.isArray(doc.flutter.assets)) {
    for (const asset of doc.flutter.assets) {
      if (typeof asset === 'string') {
        const assetPath = path.join(workspacePath, asset);
        if (fs.existsSync(assetPath)) {
          const stat = fs.statSync(assetPath);
          if (stat.isDirectory()) {
            collectFiles(assetPath, assets, workspacePath); // workspacePath 추가!
          } else {
            const relative = path.relative(workspacePath, assetPath).replace(/\\/g, '/');
            assets.push(relative);
          }
        }
      }
    }
  }

  return assets;
}

function collectFiles(dir: string, result: string[], workspacePath: string) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, result, workspacePath);
    } else {
      const relative = path.relative(workspacePath, fullPath).replace(/\\/g, '/');
      result.push(relative);
    }
  }
}
