/**
 * Where a widget is in its lifecycle.
 *
 * A widget is `draft` until published, and cannot return to `draft` afterwards —
 * publish once, then archive. Requests that would violate that produce a
 * {@link DemoError}.
 */
export type WidgetStatus = 'draft' | 'published' | 'archived';

/** A widget, the only resource this demo SDK models. */
export interface Widget {
  /** Opaque identifier, prefixed `wgt_`. Stable for the lifetime of the widget. */
  readonly id: string;

  /** Human-readable name. Not unique, and not usable as a lookup key. */
  name: string;

  /** @see {@link WidgetStatus} for the permitted transitions. */
  status: WidgetStatus;

  /** Creation time, in UTC. */
  readonly createdAt: Date;

  /**
   * Arbitrary key-value pairs stored alongside the widget and returned verbatim.
   *
   * Values are strings; the API does not coerce numbers or booleans, so
   * round-tripping a number gives back `"42"` rather than `42`.
   */
  metadata: Readonly<Record<string, string>>;
}

/** Fields accepted when creating a widget. */
export interface CreateWidgetInput {
  /** Required. Trimmed, and must be non-empty after trimming. */
  name: string;

  /** Defaults to `draft`. Passing `archived` is rejected — nothing is born archived. */
  status?: WidgetStatus;

  /** Optional metadata. Keys are limited to 40 characters. */
  metadata?: Record<string, string>;
}

/** Filters and pagination for {@link WidgetsResource.list}. */
export interface ListWidgetsOptions {
  /** Return only widgets in this status. Omit for all statuses. */
  status?: WidgetStatus;

  /** How many to return per page, 1–100. Defaults to 25. */
  limit?: number;

  /**
   * Opaque cursor from a previous page's {@link Page.nextCursor}.
   *
   * Cursors are tied to the filters they were produced with; reusing one with a
   * different `status` gives undefined results rather than an error.
   */
  cursor?: string;
}

/**
 * One page of results.
 *
 * @typeParam T - The element type.
 */
export interface Page<T> {
  /** The items on this page, in creation order, newest first. */
  readonly items: readonly T[];

  /** Cursor for the next page, or `null` on the last page. */
  readonly nextCursor: string | null;
}
