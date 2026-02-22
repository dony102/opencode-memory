const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const getObject = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    return {};
  }
  return value;
};

export const getRequiredString = (
  source: Record<string, unknown>,
  key: string
): string => {
  const value = source[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid or missing '${key}'`);
  }
  return value;
};

export const getOptionalString = (
  source: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`Invalid '${key}': expected string`);
  }
  return value;
};

export const getRequiredNumber = (
  source: Record<string, unknown>,
  key: string
): number => {
  const value = source[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid or missing '${key}'`);
  }
  return value;
};

export const getOptionalNumber = (
  source: Record<string, unknown>,
  key: string
): number | undefined => {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid '${key}': expected number`);
  }
  return value;
};

export const getOptionalStringArray = (
  source: Record<string, unknown>,
  key: string
): string[] | undefined => {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid '${key}': expected string[]`);
  }
  return value;
};
