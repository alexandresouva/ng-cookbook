import { ComponentFixture } from '@angular/core/testing';

import { DispatchHelper } from './composition/dispatch-helper';
import { QueryHelper } from './composition/query-helper';
import { TriggerHelper } from './composition/trigger-helper';

/**
 * TestHelper is the single entry point for interacting with Angular components in tests.
 *
 * It composes three helpers with different responsibilities:
 *
 * - queries:
 *   Read-only helpers to find elements and extract information
 *   (text content, values, component instances, etc).
 *
 * - trigger:
 *   Uses Angular DebugElement to trigger event handlers directly.
 *   Best suited for unit tests focused on component logic.
 *   Does NOT simulate real DOM behavior (no bubbling, no document listeners).
 *
 * - dispatch:
 *   Dispatches real DOM events on native elements.
 *   Required when testing HostListeners, event bubbling,
 *   or interactions that depend on browser behavior.
 *
 * Prefer `trigger` for fast, isolated tests.
 * Use `dispatch` only when real DOM behavior is required.
 */
export class TestHelper<T> {
  readonly queries: QueryHelper<T>;
  readonly trigger: TriggerHelper<T>;
  readonly dispatch: DispatchHelper<T>;

  constructor(fixture: ComponentFixture<T>) {
    this.queries = new QueryHelper(fixture);
    this.trigger = new TriggerHelper(this.queries);
    this.dispatch = new DispatchHelper(this.queries);
  }
}
