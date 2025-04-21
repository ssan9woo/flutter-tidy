import * as vscode from 'vscode';

/**
 * 상태 표시줄에 분석 진행 상황을 표시합니다.
 * 
 * @param message 표시할 메시지
 * @returns 생성된 상태 표시줄 항목
 */
export function showStatusBarProgress(message: string): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = `$(sync~spin) ${message}`;
    statusBarItem.tooltip = 'Flutter Tidy Analysis in progress';
    statusBarItem.show();
    return statusBarItem;
}

/**
 * 비동기 작업 처리를 위한 타임아웃 프로미스
 * 
 * @param ms 지연할 시간(밀리초)
 * @returns 프로미스
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
} 