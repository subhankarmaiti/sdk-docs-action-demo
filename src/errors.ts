/**
 * Base class for every error this SDK raises deliberately.
 *
 * Catching `DemoError` catches all of them; catch the subclasses to distinguish
 * cases worth handling differently, such as a retryable rate limit.
 */
export class DemoError extends Error {
  /** HTTP status that produced this error, or `0` for a client-side failure. */
  readonly status: number;

  /** Server-assigned request identifier, useful when reporting a problem. */
  readonly requestId: string | undefined;

  constructor(message: string, status = 0, requestId?: string) {
    super(message);
    this.name = 'DemoError';
    this.status = status;
    this.requestId = requestId;
  }
}

/**
 * The request was rejected because the rate limit was exceeded.
 *
 * Retryable: wait {@link retryAfterSeconds} and try again. The client retries
 * these automatically unless retries are disabled.
 */
export class RateLimitError extends DemoError {
  /** How long to wait before retrying, from the `Retry-After` header. */
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number, requestId?: string) {
    super(message, 429, requestId);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * The requested resource does not exist, or is not visible to this API key.
 *
 * The API does not distinguish those two cases on purpose, so that a key cannot
 * be used to probe for the existence of resources it cannot read.
 */
export class NotFoundError extends DemoError {
  /** The identifier that was not found. */
  readonly resourceId: string;

  constructor(resourceId: string, requestId?: string) {
    super(`No such resource: ${resourceId}`, 404, requestId);
    this.name = 'NotFoundError';
    this.resourceId = resourceId;
  }
}
