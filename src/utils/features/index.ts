import FeatureFlagsData from "data/features";
import { useCallback, useEffect, useState } from "react";
import { buildFeatureFlagStorageKey } from "../storage";

function getFeatureById(featureFlagId: string) {
  const featureFlag = FeatureFlagsData.flags.find(
    (value) => value.id === featureFlagId,
  );
  if (!featureFlag) {
    throw new Error(`Feature flag with id ${featureFlagId} not found`);
  }

  return featureFlag;
}

function parseStoredFeatureFlagValue(
  value: string | null,
  defaultValue: boolean,
): boolean {
  if (value === null) return defaultValue;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return defaultValue;
}

function readFeatureFlagValue(featureFlagId: string): boolean {
  const featureFlag = getFeatureById(featureFlagId);
  const storageKey = buildFeatureFlagStorageKey(featureFlagId);

  try {
    return parseStoredFeatureFlagValue(
      window.localStorage.getItem(storageKey),
      featureFlag.defaultValue,
    );
  } catch {
    return featureFlag.defaultValue;
  }
}

function writeFeatureFlagValue(featureFlagId: string, value: boolean) {
  window.localStorage.setItem(
    buildFeatureFlagStorageKey(featureFlagId),
    value ? "true" : "false",
  );
}

export function useFeatureFlag(
  featureFlagId: string,
): [boolean, (newValue: boolean) => void] {
  const defaultValue = getFeatureById(featureFlagId).defaultValue;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(readFeatureFlagValue(featureFlagId));
  }, [featureFlagId]);

  const updateValue = useCallback(
    (newValue: boolean) => {
      writeFeatureFlagValue(featureFlagId, newValue);
      setValue(newValue);
    },
    [featureFlagId],
  );

  return [value, updateValue];
}
