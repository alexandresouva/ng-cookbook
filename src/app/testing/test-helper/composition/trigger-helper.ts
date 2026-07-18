import { DebugElement } from '@angular/core';

import { QueryHelper } from './query-helper';

export class TriggerHelper<T> {
  constructor(private readonly queries: QueryHelper<T>) {}

  private getDebugElement(testId: string, host?: DebugElement): DebugElement {
    const el = this.queries.query(testId, host);

    if (!el) {
      throw new Error(`[TriggerHelper] Element with testId="${testId}" not found`);
    }

    return el;
  }

  click(testId: string, host?: DebugElement): void {
    this.getDebugElement(testId, host).triggerEventHandler('click', null);
  }

  input(testId: string, value: unknown, host?: DebugElement): void {
    this.getDebugElement(testId, host).triggerEventHandler('input', {
      target: { value },
    });
  }

  checkboxChange(testId: string, checked: boolean, host?: DebugElement): void {
    this.getDebugElement(testId, host).triggerEventHandler('change', {
      target: { checked },
    });
  }

  submit(testId: string, host?: DebugElement): void {
    this.getDebugElement(testId, host).triggerEventHandler('submit', null);
  }
}
