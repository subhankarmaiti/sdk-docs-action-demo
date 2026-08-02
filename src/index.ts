/**
 * A small demonstration SDK for {@link https://github.com/subhankarmaiti/sdk-docs-hub | sdk-docs-hub}.
 *
 * It exists so the documentation action has something realistic to publish: enough
 * surface area to produce a multi-page site with a sidebar and a search box, which
 * is what the version selector has to mount itself into.
 *
 * @example Creating a client and fetching a widget
 * ```ts
 * import { DemoClient } from 'sdk-docs-action-demo';
 *
 * const client = new DemoClient({ apiKey: process.env.DEMO_API_KEY! });
 * const widget = await client.widgets.get('wgt_123');
 * console.log(widget.name);
 * ```
 *
 * @packageDocumentation
 */

export { DemoClient } from './client.js';
export { WidgetsResource } from './widgets.js';
export { WebhooksResource } from './webhooks.js';
export { DemoError, RateLimitError, NotFoundError } from './errors.js';
export type { DemoClientOptions, RetryOptions } from './client.js';
export type { Widget, WidgetStatus, CreateWidgetInput, ListWidgetsOptions, Page } from './types.js';
export type { WebhookEvent, WebhookSubscription, CreateWebhookInput } from './webhooks.js';
