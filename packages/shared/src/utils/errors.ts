export class RealtimeError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(`RealtimeError[${code}]: ${message}. See https://realtimejs.dev/docs/errors#${code}`);
    this.name = 'RealtimeError';
    this.code = code;
  }
}

export const ERROR_CODES = {
  TRANSPORT_MISSING: 100,
  FEATURE_DISABLED: 101,
  INVALID_TOKEN: 200,
  AUTH_ADAPTER_MISSING: 201,
  DATABASE_ADAPTER_MISSING: 300,
  STORAGE_ADAPTER_MISSING: 400,
  UPLOAD_FAILED: 401,
} as const;
