export type FeatureFlagStorageKey = `ff.${string}`;
export type ToolStorageKey = `tools.${string}.${string}`;
export type StorageKey = FeatureFlagStorageKey | ToolStorageKey;

export function buildFeatureFlagStorageKey(featureFlagId: string): FeatureFlagStorageKey {
  return `ff.${featureFlagId}`;
}

export function buildToolStorageKey(toolId: string, field: string): ToolStorageKey {
  return `tools.${toolId}.${field}`;
}
