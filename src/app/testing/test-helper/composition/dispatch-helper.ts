import { DebugElement } from '@angular/core';

import { QueryHelper } from './query-helper';

export class DispatchHelper<T> {
  constructor(private readonly queries: QueryHelper<T>) {}

  private getNativeElement<E extends HTMLElement = HTMLElement>(
    testId: string,
    host?: DebugElement,
  ): E {
    const debugEl = this.queries.query(testId, host);

    if (!debugEl) {
      throw new Error(`[DispatchHelper] Element with testId="${testId}" not found`);
    }

    return debugEl.nativeElement as E;
  }

  click(testId: string, host?: DebugElement): void {
    const el = this.getNativeElement(testId, host);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  input(testId: string, value: string, host?: DebugElement): void {
    const el = this.getNativeElement<HTMLInputElement>(testId, host);
    el.value = value;

    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
  }

  checkboxChange(testId: string, checked: boolean, host?: DebugElement): void {
    const el = this.getNativeElement<HTMLInputElement>(testId, host);
    el.checked = checked;

    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  }

  submit(testId: string, host?: DebugElement): void {
    const el = this.getNativeElement<HTMLFormElement>(testId, host);
    el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }

  clickAtViewportPoint(x: number, y: number): void {
    document.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }),
    );
  }
}
