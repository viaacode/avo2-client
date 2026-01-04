import { ROUTE_PARTS } from '../../shared/constants/routes';

export const COLLECTIONS_OR_BUNDLES_PATH = {
  COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
  COLLECTION_ACTUALISATION_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.actualisation}`,
  COLLECTION_QUALITYCHECK_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.qualitycheck}`,
  COLLECTION_MARCOM_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}/${ROUTE_PARTS.marcom}`,
  BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
  BUNDLE_ACTUALISATION_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.actualisation}`,
  BUNDLE_QUALITYCHECK_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.qualitycheck}`,
  BUNDLE_MARCOM_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}/${ROUTE_PARTS.marcom}`,
};
