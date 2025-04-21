import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { analyzeAssetUsage } from '../analyze/asset_analyze/asset_analyzer';

suite('Asset Analyzer Tests', () => {
    // 임시 디렉토리 생성
    let tempDir: string;

    setup(() => {
        // 테스트 전 임시 디렉토리 생성
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flutter-tidy-test-'));

        // 필요한 디렉토리 구조 생성
        createTestAssetStructure(tempDir);
    });

    teardown(() => {
        // 테스트 후 임시 디렉토리 삭제
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('Should detect unused assets correctly', async () => {
        const result = await analyzeAssetUsage(tempDir);

        // 디버깅을 위한 로그 추가
        console.log('===== DEBUG: Asset Analyzer Test =====');
        console.log('Temp Directory:', tempDir);
        console.log('All Assets:', result.allAssets);
        console.log('All Assets Count:', result.allAssets.length);
        console.log('Used Assets:', [...result.usedAssets]);
        console.log('Used Assets Count:', result.usedAssets.size);
        console.log('Unused Assets:', result.unusedAssets);
        console.log('Unused Assets Count:', result.unusedAssets.length);
        console.log('===== END DEBUG =====');

        // 중복을 제거한 고유 에셋 수 확인
        const uniqueAssets = new Set(result.allAssets);
        assert.strictEqual(uniqueAssets.size, 5);

        // 사용된 에셋이 정확히 식별되었는지 확인 
        assert.strictEqual(result.usedAssets.size, 3);

        // 사용되지 않은 에셋이 정확히 식별되었는지 확인
        assert.strictEqual(result.unusedAssets.length, 2);

        // 상대 경로 기반 검사
        assert.ok(result.unusedAssets.some(p => p.includes('unused_image1.png')));
        assert.ok(result.unusedAssets.some(p => p.includes('unused_image2.png')));
    });

    test('Should detect assets referenced in various string formats', async () => {
        const result = await analyzeAssetUsage(tempDir);

        // 다양한 문자열 포맷으로 참조된 에셋이 정확히 식별되는지 확인

        // 디버깅을 위한 로그 추가
        console.log('===== DEBUG: Asset Reference Test =====');
        console.log('Used Assets:', [...result.usedAssets]);
        console.log('===== END DEBUG =====');

        // 상대 경로 기반 검사
        assert.ok([...result.usedAssets].some(p => p.includes('images/used_image1.png'))); // 단일 따옴표로 참조
        assert.ok([...result.usedAssets].some(p => p.includes('images/used_image2.png'))); // 이중 따옴표로 참조
        assert.ok([...result.usedAssets].some(p => p.includes('icons/used_icon.png')));    // 삼중 따옴표로 참조
    });
});

/**
 * 테스트를 위한 에셋 구조를 생성합니다.
 */
function createTestAssetStructure(rootDir: string): void {
    // 1. 에셋 디렉토리 생성
    const assetsDir = path.join(rootDir, 'assets');
    fs.mkdirSync(assetsDir);

    // 이미지 및 아이콘 디렉토리 생성
    const imagesDir = path.join(assetsDir, 'images');
    const iconsDir = path.join(assetsDir, 'icons');
    fs.mkdirSync(imagesDir);
    fs.mkdirSync(iconsDir);

    // 2. lib 디렉토리 생성
    const libDir = path.join(rootDir, 'lib');
    fs.mkdirSync(libDir);

    // 3. 더미 이미지 파일 생성 (사용/미사용 에셋)
    // 사용되는 에셋 파일들
    fs.writeFileSync(path.join(imagesDir, 'used_image1.png'), 'dummy image content');
    fs.writeFileSync(path.join(imagesDir, 'used_image2.png'), 'dummy image content');
    fs.writeFileSync(path.join(iconsDir, 'used_icon.png'), 'dummy icon content');

    // 사용되지 않는 에셋 파일들
    fs.writeFileSync(path.join(assetsDir, 'unused_image1.png'), 'dummy image content');
    fs.writeFileSync(path.join(assetsDir, 'unused_image2.png'), 'dummy image content');

    // 4. pubspec.yaml 파일 생성
    const pubspecContent = `
name: flutter_test_app
description: A test Flutter project.

version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

flutter:
  assets:
    - assets/
    - assets/images/
    - assets/icons/
  `;
    fs.writeFileSync(path.join(rootDir, 'pubspec.yaml'), pubspecContent);

    // 5. 에셋을 참조하는 Dart 파일들 생성
    // 단일 따옴표로 참조하는 파일
    const dartFile1 = `
import 'package:flutter/material.dart';

class ImageWidget1 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Image.asset('assets/images/used_image1.png');
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'image_widget1.dart'), dartFile1);

    // 이중 따옴표로 참조하는 파일
    const dartFile2 = `
import 'package:flutter/material.dart';

class ImageWidget2 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Image.asset("assets/images/used_image2.png");
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'image_widget2.dart'), dartFile2);

    // 삼중 따옴표로 참조하는 파일 (문자열 보간 내부에 에셋 경로 포함)
    const dartFile3 = `
import 'package:flutter/material.dart';

class IconWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final iconPath = '''assets/icons/used_icon.png''';
    return Image.asset(iconPath);
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'icon_widget.dart'), dartFile3);
} 