import { DemoError } from './errors.js';

/**
 * The event names a webhook subscription can listen for.
 *
 * @since 3.0.0
 */
export type WebhookEvent = 'widget.created' | 'widget.updated' | 'widget.deleted';

/**
 * A webhook subscription, as returned by {@link WebhooksResource.create}.
 *
 * @since 3.0.0
 */
export interface WebhookSubscription {
  /** Opaque identifier, e.g. `whk_8f2a`. */
  id: string;
  /** The HTTPS endpoint events are delivered to. */
  url: string;
  /** The events this subscription receives. */
  events: WebhookEvent[];
  /**
   * Secret used to sign deliveries. Returned only when the subscription is
   * created — it is not retrievable afterwards.
   */
  secret?: string;
}

/** Fields accepted when creating a subscription. */
export interface CreateWebhookInput {
  /** Must be `https:`; plaintext endpoints are rejected. */
  url: string;
  /** At least one event. */
  events: WebhookEvent[];
}

/**
 * Manages webhook subscriptions.
 *
 * Reached through {@link DemoClient.webhooks} rather than constructed directly.
 *
 * @since 3.0.0
 *
 * @example Subscribing to widget lifecycle events
 * ```ts
 * const hook = await client.webhooks.create({
 *   url: 'https://example.com/hooks/widgets',
 *   events: ['widget.created', 'widget.deleted'],
 * });
 * // Store hook.secret now; it is not returned again.
 * console.log(hook.secret);
 * ```
 */
export class WebhooksResource {
  readonly #subscriptions = new Map<string, WebhookSubscription>();
  #counter = 0;

  /**
   * Creates a subscription.
   *
   * @param input - The endpoint and the events to deliver to it.
   * @returns The subscription, including its signing secret.
   * @throws {@link DemoError} if the URL is not HTTPS or no events are given.
   */
  create(input: CreateWebhookInput): WebhookSubscription {
    if (!input.url.startsWith('https://')) {
      throw new DemoError('Webhook endpoints must use https', 400);
    }
    if (input.events.length === 0) {
      throw new DemoError('A subscription needs at least one event', 400);
    }
    this.#counter += 1;
    const subscription: WebhookSubscription = {
      id: `whk_${this.#counter}`,
      url: input.url,
      events: [...input.events],
      secret: `whsec_${this.#counter}`,
    };
    // The stored copy omits the secret, mirroring the API: it is shown once.
    const { secret: _secret, ...stored } = subscription;
    this.#subscriptions.set(subscription.id, stored);
    return subscription;
  }

  /**
   * Lists every subscription, without secrets.
   *
   * @returns The subscriptions, in creation order.
   */
  list(): WebhookSubscription[] {
    return [...this.#subscriptions.values()];
  }

  /**
   * Removes a subscription.
   *
   * @param id - The subscription to remove.
   * @returns Whether a subscription was removed.
   */
  delete(id: string): boolean {
    return this.#subscriptions.delete(id);
  }
}
