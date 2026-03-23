import { PersonalData } from "data";

export const SITE_OWNER_NAME = PersonalData.name.full;

export function getPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${SITE_OWNER_NAME}` : SITE_OWNER_NAME;
}