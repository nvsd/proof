export type Result<T> = { success: true; data: T } | { success: false; error: unknown };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function fail(error: unknown): Result<never> {
  return { success: false, error };
}
