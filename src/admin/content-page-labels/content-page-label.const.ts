import { ROUTE_PARTS } from '../../shared/constants/index.js';

export const CONTENT_PAGE_LABEL_PATH = {
	CONTENT_PAGE_LABEL_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}`,
	CONTENT_PAGE_LABEL_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/${ROUTE_PARTS.create}`,
	CONTENT_PAGE_LABEL_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/:id`,
	CONTENT_PAGE_LABEL_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.contentPageLabels}/:id/${ROUTE_PARTS.edit}`,
};
