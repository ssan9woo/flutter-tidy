import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { analyzeFileUsage } from '../analyze/file_analyze/file_analyzer';

suite('File Analyzer Tests', () => {
    // 임시 디렉토리 생성
    let tempDir: string;

    setup(() => {
        // 테스트 전 임시 디렉토리 생성
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flutter-tidy-test-'));

        // lib 디렉토리 생성
        const libDir = path.join(tempDir, 'lib');
        fs.mkdirSync(libDir);

        // 테스트 파일 구조 생성
        createTestFileStructure(libDir);
    });

    teardown(() => {
        // 테스트 후 임시 디렉토리 삭제
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('Should detect unused files correctly', async () => {
        const result = await analyzeFileUsage(tempDir);

        // 모든 파일이 정확히 수집되었는지 확인
        assert.strictEqual(result.allFiles.length, 7);

        // 사용된 파일이 정확히 식별되었는지 확인
        assert.strictEqual(result.importedFiles.size, 5);

        // 사용되지 않은 파일이 정확히 식별되었는지 확인
        assert.strictEqual(result.unusedFiles.length, 2);
        assert.ok(result.unusedFiles.includes(path.join(tempDir, 'lib/unused_file1.dart')));
        assert.ok(result.unusedFiles.includes(path.join(tempDir, 'lib/unused_file2.dart')));
    });

    test('Should handle import relationships correctly', async () => {
        const result = await analyzeFileUsage(tempDir);

        // main.dart가 imports를 통해 imported_file.dart를 가져오는지 확인
        const mainFile = path.join(tempDir, 'lib/main.dart');
        const importedFile = path.join(tempDir, 'lib/imported_file.dart');

        assert.ok(result.allFiles.includes(mainFile));
        assert.ok(result.allFiles.includes(importedFile));
        assert.ok(result.importedFiles.has(importedFile));
        assert.ok(!result.unusedFiles.includes(importedFile));
    });

    test('Should handle part/part of relationships correctly', async () => {
        const result = await analyzeFileUsage(tempDir);

        // library_file.dart가 part를 통해 part_file.dart를 가져오는지 확인
        const libraryFile = path.join(tempDir, 'lib/library_file.dart');
        const partFile = path.join(tempDir, 'lib/part_file.dart');

        assert.ok(result.allFiles.includes(libraryFile));
        assert.ok(result.allFiles.includes(partFile));
        assert.ok(result.importedFiles.has(partFile));
        assert.ok(!result.unusedFiles.includes(partFile));
    });
});

/**
 * 테스트를 위한 파일 구조를 생성합니다.
 */
function createTestFileStructure(libDir: string): void {
    // 1. main.dart - import 문으로 다른 파일을 참조하는 메인 파일
    fs.writeFileSync(path.join(libDir, 'main.dart'), `
import 'dart:async';
import 'package:flutter/material.dart';
import 'imported_file.dart';
import 'export_file.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(),
    );
  }
}
  `);

    // 2. imported_file.dart - main.dart에서 import하는 파일
    fs.writeFileSync(path.join(libDir, 'imported_file.dart'), `
import 'package:flutter/material.dart';

class ImportedWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
  `);

    // 3. export_file.dart - 다른 파일을 export하는 파일
    fs.writeFileSync(path.join(libDir, 'export_file.dart'), `
export 'imported_file.dart';
  `);

    // 4. library_file.dart - part 지시문을 포함하는 라이브러리 파일
    fs.writeFileSync(path.join(libDir, 'library_file.dart'), `
library my_library;

import 'package:flutter/material.dart';

part 'part_file.dart';

class LibraryClass {
  void doSomething() {
    print('Doing something');
  }
}
  `);

    // 5. part_file.dart - library_file.dart의 일부
    fs.writeFileSync(path.join(libDir, 'part_file.dart'), `
part of my_library;

class PartClass {
  void doSomethingElse() {
    print('Doing something else');
  }
}
  `);

    // 6-7. 사용되지 않는 파일들
    fs.writeFileSync(path.join(libDir, 'unused_file1.dart'), `
import 'package:flutter/material.dart';

class UnusedWidget1 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
  `);

    fs.writeFileSync(path.join(libDir, 'unused_file2.dart'), `
import 'package:flutter/material.dart';

class UnusedWidget2 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
  `);
} 