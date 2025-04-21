# Change Log

All notable changes to the "Flutter Tidy" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.1] - 2024-03-24

### Added
- Initial release of Flutter Tidy
- Feature: Unused assets detection
  - Scans project for unused image files and other assets
  - Identifies assets defined in `pubspec.yaml` but not referenced in code
- Feature: Unused dependencies detection
  - Analyzes `pubspec.yaml` to find unused package dependencies
- Feature: Unused files detection
  - Identifies unreferenced Dart files in the project
  - Supports various Dart file relationships (import, export, part, library)