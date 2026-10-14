/**
 * Domain error classes for figma-mcp.
 * Zero external dependencies.
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BridgeConnectionError extends DomainError {
  constructor(message: string = 'Figma Plugin is not connected to the local bridge') {
    super(message);
    this.name = 'BridgeConnectionError';
  }
}

export class FigmaPluginTimeoutError extends DomainError {
  constructor(action: string, timeoutMs: number) {
    super(`Figma Plugin timed out after ${timeoutMs}ms while executing action: ${action}`);
    this.name = 'FigmaPluginTimeoutError';
  }
}

export class ConfigNotFoundError extends DomainError {
  constructor(public readonly key: string) {
    super(`Missing required configuration key: ${key}`);
    this.name = 'ConfigNotFoundError';
  }
}

export class CryptoError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}
