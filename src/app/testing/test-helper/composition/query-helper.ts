import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

type ElementWithValue = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export class QueryHelper<T> {
  private readonly root: DebugElement;

  constructor(fixture: ComponentFixture<T>) {
    this.root = fixture.debugElement;
  }

  query(testId: string, host: DebugElement = this.root): DebugElement | null {
    return host.query(By.css(`[data-testid="${testId}"]`));
  }

  queryAll(testId: string, host: DebugElement = this.root): DebugElement[] {
    return host.queryAll(By.css(`[data-testid="${testId}"]`));
  }

  getComponentInstance<C>(testId: string, host: DebugElement = this.root): C | null {
    const instance = this.query(testId, host)?.componentInstance as C | undefined;
    return instance ?? null;
  }

  getTextContent(testId: string, host: DebugElement = this.root): string | null {
    return this.getNativeElement<HTMLElement>(testId, host)?.textContent?.trim() ?? null;
  }

  getValue(testId: string, host: DebugElement = this.root): string | null {
    return this.getNativeElement<ElementWithValue>(testId, host)?.value ?? null;
  }

  getChecked(testId: string, host: DebugElement = this.root): boolean | null {
    return this.getNativeElement<HTMLInputElement>(testId, host)?.checked ?? null;
  }

  private getNativeElement<E extends HTMLElement>(
    testId: string,
    host: DebugElement = this.root,
  ): E | null {
    const element = this.query(testId, host)?.nativeElement as E | undefined;
    return element ?? null;
  }
}
