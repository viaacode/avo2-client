import { Avo } from '@viaa/avo2-types';

import { ASSIGNMENT_PATH } from './assignment/assignment.const';
import { AUTH_PATH } from './authentication/authentication.const';
import { BUNDLE_PATH } from './bundle/bundle.const';
import { COLLECTION_PATH } from './collection/collection.const';
import { HOME_PATH } from './home/home.const';
import { ITEM_PATH } from './item/item.const';
import { PUPILS_PATH } from './pupils/pupils.const';
import { SEARCH_PATH } from './search/search.const';
import { SETTINGS_PATH } from './settings/settings.const';
import { ROUTE_PARTS } from './shared/constants';
import { TEACHERS_PATH } from './teachers/teachers.const';
import { WORKSPACE_PATH } from './workspace/workspace.const';
import { USER_ITEM_REQUEST_FORM_PATH } from './user-item-request-form/user-item-request-form.consts';

export const APP_PATH = Object.freeze({
	...ASSIGNMENT_PATH,
	...AUTH_PATH,
	...COLLECTION_PATH,
	...BUNDLE_PATH,
	...TEACHERS_PATH,
	...PUPILS_PATH,
	...HOME_PATH,
	...ITEM_PATH,
	...SEARCH_PATH,
	...WORKSPACE_PATH,
	...SETTINGS_PATH,
	...USER_ITEM_REQUEST_FORM_PATH,
	// TODO: Replace once available
	NEWS: `/${ROUTE_PARTS.news}`,
	PROJECTS: `/${ROUTE_PARTS.projects}`,
	SETTINGS: `/${ROUTE_PARTS.settings}`,
	HELP: `/${ROUTE_PARTS.help}`,
	FEEDBACK: `/${ROUTE_PARTS.feedback}`,
	ERROR: `/${ROUTE_PARTS.error}`,
});

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: APP_PATH.ITEM_DETAIL,
	audio: APP_PATH.ITEM_DETAIL,
	collectie: APP_PATH.COLLECTION_DETAIL,
	bundel: APP_PATH.BUNDLE_DETAIL,
};
