export interface FeatureFlagEntry {
  name: string;
  desc: string;
  id: string;
  defaultValue: boolean;
}

const allFeatureFlags: FeatureFlagEntry[] = [
  {
    name: "Blogs",
    desc: "View blogs",
    id: "blogs",
    defaultValue: true,
  },
];

const FeatureFlagsData = {
  featuresPage: {
    title: "Feature Flags",
    subtitle: "Enable new functionalities with the feature flags listed below",
  },
  featuresIds: {
    GOAL_KEEPER: "goal.keeper",
    BLOGS: "blogs",
  },
  flags: allFeatureFlags,
};

export default FeatureFlagsData;
