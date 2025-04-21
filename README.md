# Flutter Tidy

Flutter Tidy is a VSCode extension that helps you maintain a clean Flutter project by identifying and removing unused resources.

## Features

### 1. Unused Assets Detection
- Scans your project for unused image files, icons, and other assets
- Identifies assets defined in `pubspec.yaml` but not referenced in code
- Helps reduce app size by removing unnecessary resources

### 2. Unused Dependencies Detection
- Analyzes `pubspec.yaml` to find unused package dependencies
- Helps maintain a lean dependency tree
- Improves build time by removing unnecessary packages

### 3. Unused Files Detection
- Identifies Dart files that are not referenced anywhere in your project
- Considers various Dart file relationships:
  - Import statements
  - Export statements
  - Part/Part of relationships
  - Library declarations
- Helps keep your codebase clean and maintainable

## Usage

1. Open your Flutter project in VSCode
2. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Type "Flutter Tidy" to see available commands:
   - `Flutter Tidy: Analyze Unused Assets`
   - `Flutter Tidy: Analyze Unused Dependencies`
   - `Flutter Tidy: Analyze Unused Files`

## Requirements

- Visual Studio Code version 1.99.0 or higher
- Flutter project with a valid `pubspec.yaml` file

## Known Issues

Please report any issues on our [GitHub repository](https://github.com/ssan9woo/flutter-tidy/issues).

## Release Notes

### 0.0.1

Initial release of Flutter Tidy with core features:
- Unused assets detection
- Unused dependencies detection
- Unused files detection

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
