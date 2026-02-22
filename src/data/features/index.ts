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
  {
    name: "Force empty states",
    desc: "Show empty states for projects, work experience, and blogs",
    id: "dev.force-empty-states",
    defaultValue: false,
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
    FORCE_EMPTY_STATES: "dev.force-empty-states",
  },
  flags: allFeatureFlags,
};

export default FeatureFlagsData;
