import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { analyzePackageUsage } from '../analyze/package_analyze/package_analyzer';

suite('Dependency Analyzer Tests', () => {
    // 임시 디렉토리 생성
    let tempDir: string;

    setup(() => {
        // 테스트 전 임시 디렉토리 생성
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flutter-tidy-test-'));

        // 필요한 디렉토리 구조 생성
        createTestDependencyStructure(tempDir);
    });

    teardown(() => {
        // 테스트 후 임시 디렉토리 삭제
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('Should detect unused dependencies correctly', async () => {
        const result = await analyzePackageUsage(tempDir);

        // 모든 의존성 패키지가 정확히 수집되었는지 확인
        assert.strictEqual(result.generic.all.length, 5);

        // 사용된 의존성 패키지가 정확히 식별되었는지 확인
        assert.strictEqual(result.generic.used.size, 2);
        assert.ok(result.generic.used.has('http'));
        assert.ok(result.generic.used.has('path_provider'));

        // 사용되지 않은 의존성 패키지가 정확히 식별되었는지 확인
        assert.strictEqual(result.generic.unused.length, 3);
        assert.ok(result.generic.unused.includes('shared_preferences'));
        assert.ok(result.generic.unused.includes('sqflite'));
        assert.ok(result.generic.unused.includes('cupertino_icons'));
    });

    test('Should exclude Flutter SDK dependencies from analysis', async () => {
        const result = await analyzePackageUsage(tempDir);

        // Flutter SDK 의존성은 분석에서 제외되는지 확인
        assert.ok(!result.generic.all.includes('flutter'));
        assert.ok(!result.generic.unused.includes('flutter'));
    });
});

/**
 * 테스트를 위한 의존성 구조를 생성합니다.
 */
function createTestDependencyStructure(rootDir: string): void {
    // 1. lib 디렉토리 생성
    const libDir = path.join(rootDir, 'lib');
    fs.mkdirSync(libDir);

    // 2. pubspec.yaml 파일 생성 (사용/미사용 의존성 포함)
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
  # 사용되는 의존성
  http: ^0.13.5
  path_provider: ^2.0.12
  # 사용되지 않는 의존성
  shared_preferences: ^2.0.18
  sqflite: ^2.2.6
  `;
    fs.writeFileSync(path.join(rootDir, 'pubspec.yaml'), pubspecContent);

    // 3. 의존성을 사용하는 Dart 파일 생성
    // http 패키지를 사용하는 파일
    const apiServiceFile = `
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ApiService {
  Future<String> fetchData() async {
    final response = await http.get(Uri.parse('https://example.com/api/data'));
    if (response.statusCode == 200) {
      return response.body;
    } else {
      throw Exception('Failed to load data');
    }
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'api_service.dart'), apiServiceFile);

    // path_provider 패키지를 사용하는 파일
    const fileServiceFile = `
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';

class FileService {
  Future<String> getLocalFilePath() async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }
  
  Future<File> writeToFile(String data) async {
    final path = await getLocalFilePath();
    final file = File('\$path/my_file.txt');
    return file.writeAsString(data);
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'file_service.dart'), fileServiceFile);

    // 아무 의존성도 사용하지 않는 파일
    const widgetFile = `
import 'package:flutter/material.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('Hello World'),
    );
  }
}
  `;
    fs.writeFileSync(path.join(libDir, 'my_widget.dart'), widgetFile);
} 