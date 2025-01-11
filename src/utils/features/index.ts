import FeatureFlagsData from "data/features";
import { useEffect, useState } from "react";

class FeatureFlagsManager {
  constructor() {}

  private getLocalStorageKeyFromFeatureFlagId(featureFlagId: string) {
    return `ff.${featureFlagId}`;
  }

  getFeatureById(featureFlagId: string) {
    const featureFlag = FeatureFlagsData.flags.find(
      (value, _, __) => value.id == featureFlagId,
    );
    if (featureFlag) {
      return featureFlag;
    } else {
      throw new Error(`Feature flag with id ${featureFlagId} not found`);
    }
  }

  getFeatureFlagValue(featureFlagId: string) {
    const featureFlag = this.getFeatureById(featureFlagId);
    const ffValueString = localStorage.getItem(
      this.getLocalStorageKeyFromFeatureFlagId(featureFlagId),
    );
    if (ffValueString === null) {
      return featureFlag.defaultValue;
    } else if (ffValueString.toLowerCase() === "true") {
      return true;
    } else if (ffValueString.toLowerCase() === "false") {
      return false;
    } else {
      return featureFlag.defaultValue;
    }
  }

  isFeatureFlagEnabled(featureFlagId: string) {
    return this.getFeatureFlagValue(featureFlagId) == true;
  }

  isFeatureFlagDisabled(featureFlagId: string) {
    return this.getFeatureFlagValue(featureFlagId) == false;
  }

  resetFeatureFlagValue(featureFlagId: string) {
    localStorage.removeItem(
      this.getLocalStorageKeyFromFeatureFlagId(featureFlagId),
    );
  }

  setFeatureFlagValue(featureFlagId: string, value: boolean) {
    localStorage.setItem(
      this.getLocalStorageKeyFromFeatureFlagId(featureFlagId),
      value ? "true" : "false",
    );
  }

  enableFeatureFlag(featureFlagId: string) {
    this.setFeatureFlagValue(featureFlagId, true);
  }

  disableFeatureFlag(featureFlagId: string) {
    this.setFeatureFlagValue(featureFlagId, false);
  }
}

const featureFlagsManager = new FeatureFlagsManager();

export function useFeatureFlag(
  featureFlagId: string,
): [boolean, boolean, (newValue: boolean) => void, () => void] {
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage != undefined) {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return [
      isLoading,
      featureFlagsManager.getFeatureById(featureFlagId).defaultValue,
      (_) => {},
      () => {},
    ];
  } else {
    return [
      isLoading,
      featureFlagsManager.getFeatureFlagValue(featureFlagId),
      (newValue: boolean) => {
        featureFlagsManager.setFeatureFlagValue(featureFlagId, newValue);
        setRefresh(!refresh);
      },
      () => {
        featureFlagsManager.resetFeatureFlagValue(featureFlagId);
        setRefresh(!refresh);
      },
    ];
  }
}
