import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import FeatureFlagsData from "data/features";

export const metadata: Metadata = {
  title: getPageTitle(FeatureFlagsData.featuresPage.title),
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}