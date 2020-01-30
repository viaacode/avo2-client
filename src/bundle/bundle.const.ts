import { ROUTE_PARTS } from '../shared/constants';

export const BUNDLE_PATH = Object.freeze({
	BUNDLE_DETAIL: `/${ROUTE_PARTS.bundles}/:id`,
	BUNDLE_EDIT: `/${ROUTE_PARTS.bundles}/:id/${ROUTE_PARTS.edit}`,
});
