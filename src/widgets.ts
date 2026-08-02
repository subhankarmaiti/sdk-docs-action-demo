import { NotFoundError } from './errors.js';
import type { CreateWidgetInput, ListWidgetsOptions, Page, Widget } from './types.js';

/**
 * Operations on widgets.
 *
 * Reached through {@link DemoClient.widgets} rather than constructed directly, so
 * that every request shares the client's credentials and retry policy.
 */
export class WidgetsResource {
  /** In-memory store: this is a demonstration SDK and talks to nothing. */
  readonly #store = new Map<string, Widget>();
  #counter = 0;

  /**
   * Fetches a single widget by id.
   *
   * @param id - The widget's identifier, as returned by {@link create}.
   * @returns The widget.
   * @throws {@link NotFoundError} if no widget has that id.
   *
   * @example
   * ```ts
   * const widget = await client.widgets.get('wgt_1');
   * ```
   */
  async get(id: string): Promise<Widget> {
    const widget = this.#store.get(id);
    if (!widget) throw new NotFoundError(id);
    return structuredClone(widget);
  }

  /**
   * Creates a widget.
   *
   * @param input - The widget's initial fields. See {@link CreateWidgetInput}.
   * @returns The created widget, including its assigned {@link Widget.id}.
   * @throws {@link DemoError} if `name` is empty after trimming.
   */
  async create(input: CreateWidgetInput): Promise<Widget> {
    const name = input.name.trim();
    if (name === '') throw new Error('name must not be empty');

    this.#counter += 1;
    const widget: Widget = {
      id: `wgt_${this.#counter}`,
      name,
      status: input.status ?? 'draft',
      createdAt: new Date(),
      metadata: { ...input.metadata },
    };
    this.#store.set(widget.id, widget);
    return structuredClone(widget);
  }

  /**
   * Lists widgets, newest first.
   *
   * @param options - Filters and pagination. See {@link ListWidgetsOptions}.
   * @returns One {@link Page} of widgets.
   *
   * @example Iterating every page
   * ```ts
   * let cursor: string | null | undefined;
   * do {
   *   const page = await client.widgets.list({ cursor: cursor ?? undefined });
   *   for (const widget of page.items) console.log(widget.name);
   *   cursor = page.nextCursor;
   * } while (cursor);
   * ```
   */
  async list(options: ListWidgetsOptions = {}): Promise<Page<Widget>> {
    const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
    let all = [...this.#store.values()].reverse();
    if (options.status) all = all.filter((w) => w.status === options.status);

    const start = options.cursor ? Number.parseInt(options.cursor, 10) : 0;
    const items = all.slice(start, start + limit);
    const next = start + limit;

    return {
      items: items.map((w) => structuredClone(w)),
      nextCursor: next < all.length ? String(next) : null,
    };
  }

  /**
   * Deletes a widget.
   *
   * Idempotent: deleting an already-deleted widget succeeds rather than throwing,
   * so a retried request does not fail on its second attempt.
   *
   * @param id - The widget to delete.
   */
  async delete(id: string): Promise<void> {
    this.#store.delete(id);
  }
}
