import { ROUTE_PARTS } from '../shared/constants';

export const BUNDLE_PATH = Object.freeze({
	BUNDLES_DETAIL: `/${ROUTE_PARTS.bundles}/:id`,
	BUNDLES_EDIT: `/${ROUTE_PARTS.bundles}/:id/${ROUTE_PARTS.edit}`,
});
