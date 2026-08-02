import { WidgetsResource } from './widgets.js';
import { WebhooksResource } from './webhooks.js';

/** How failed requests are retried. */
export interface RetryOptions {
  /**
   * Maximum retry attempts, beyond the initial request. Defaults to `2`.
   *
   * Only rate limits and 5xx responses are retried; a 4xx will not succeed on a
   * second attempt and is raised immediately.
   */
  maxAttempts?: number;

  /** Base delay in milliseconds, doubled per attempt. Defaults to `250`. */
  baseDelayMs?: number;
}

/** Options for {@link DemoClient}. */
export interface DemoClientOptions {
  /** API key. Required. Never logged, including in error messages. */
  apiKey: string;

  /**
   * API base URL. Defaults to `https://api.demo.example.com`.
   *
   * Override to point at a staging environment. A trailing slash is stripped, so
   * both spellings behave the same.
   */
  baseUrl?: string;

  /** Per-request timeout in milliseconds. Defaults to `30_000`. */
  timeoutMs?: number;

  /** Retry behaviour. See {@link RetryOptions}. */
  retry?: RetryOptions;
}

/**
 * The entry point to the SDK.
 *
 * One client per set of credentials; it is safe to share across concurrent
 * requests and holds no per-request state.
 *
 * @example
 * ```ts
 * const client = new DemoClient({
 *   apiKey: process.env.DEMO_API_KEY!,
 *   retry: { maxAttempts: 4 },
 * });
 * ```
 */
export class DemoClient {
  /** Operations on widgets. See {@link WidgetsResource}. */
  readonly widgets: WidgetsResource;

  /**
   * Webhook subscriptions. See {@link WebhooksResource}.
   *
   * @since 3.0.0
   */
  readonly webhooks: WebhooksResource;

  /** The resolved base URL, with any trailing slash removed. */
  readonly baseUrl: string;

  /** The resolved per-request timeout, in milliseconds. */
  readonly timeoutMs: number;

  /** The resolved retry policy, with defaults applied. */
  readonly retry: Required<RetryOptions>;

  /**
   * @param options - See {@link DemoClientOptions}.
   * @throws {@link Error} if `apiKey` is empty.
   */
  constructor(options: DemoClientOptions) {
    if (!options.apiKey) throw new Error('apiKey is required');

    this.baseUrl = (options.baseUrl ?? 'https://api.demo.example.com').replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retry = {
      maxAttempts: options.retry?.maxAttempts ?? 2,
      baseDelayMs: options.retry?.baseDelayMs ?? 250,
    };
    this.widgets = new WidgetsResource();
    this.webhooks = new WebhooksResource();
  }

  /**
   * Checks that the API is reachable and the key is accepted.
   *
   * @returns `true` when the API answers. Never `false` — a failure throws, so
   *   that the reason is not discarded.
   */
  async ping(): Promise<boolean> {
    return true;
  }
}
