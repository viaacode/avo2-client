import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from './shared/constants';

interface RouteInfo {
	route: string;
	showInContentPicker: boolean;
}

export const APP_PATH: Readonly<{ [pageId: string]: RouteInfo }> = Object.freeze({
	ASSIGNMENT_CREATE: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/${ROUTE_PARTS.create}`,
		showInContentPicker: false,
	},
	ASSIGNMENT_DETAIL: {
		route: `/${ROUTE_PARTS.assignments}/:id`,
		regexp: `/${ROUTE_PARTS.assignments}/[^/?]+`,
		showInContentPicker: false,
	},
	ASSIGNMENT_EDIT: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${ROUTE_PARTS.edit}`,
		regexp: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/[^/]+/${ROUTE_PARTS.edit}`,
		showInContentPicker: false,
	},
	ASSIGNMENT_RESPONSES: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${ROUTE_PARTS.responses}`,
		regexp: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/[^/]+/${ROUTE_PARTS.responses}`,
		showInContentPicker: false,
	},
	LOGIN: { route: `/${ROUTE_PARTS.login}`, showInContentPicker: true },
	LOGOUT: { route: `/${ROUTE_PARTS.logout}`, showInContentPicker: true },
	REGISTER_OR_LOGIN: { route: `/${ROUTE_PARTS.registerOrLogin}`, showInContentPicker: true },
	MANUAL_ACCESS_REQUEST: {
		route: `/${ROUTE_PARTS.manualAccessRequest}`,
		showInContentPicker: true,
	},
	STUDENT_TEACHER: { route: `/${ROUTE_PARTS.studentTeacher}`, showInContentPicker: true },
	STAMBOEK: { route: `/${ROUTE_PARTS.stamboek}`, showInContentPicker: true },
	COLLECTION_DETAIL: {
		route: `/${ROUTE_PARTS.collections}/:id`,
		regexp: `/${ROUTE_PARTS.collections}/[^/?]+`,
		showInContentPicker: false,
	},
	COLLECTION_EDIT: {
		route: `/${ROUTE_PARTS.collections}/:id/${ROUTE_PARTS.edit}`,
		regexp: `/${ROUTE_PARTS.collections}/[^/?]+`,
		showInContentPicker: false,
	},
	BUNDLE_DETAIL: {
		route: `/${ROUTE_PARTS.bundles}/:id`,
		regexp: `/${ROUTE_PARTS.bundles}/[^/?]+`,
		showInContentPicker: false,
	},
	BUNDLE_EDIT: {
		route: `/${ROUTE_PARTS.bundles}/:id/${ROUTE_PARTS.edit}`,
		regexp: `/${ROUTE_PARTS.bundles}/[^/?]+/${ROUTE_PARTS.edit}`,
		showInContentPicker: false,
	},
	FOR_TEACHERS: { route: `/${ROUTE_PARTS.forTeachers}`, showInContentPicker: true },
	LOGGED_OUT_HOME: { route: '/', showInContentPicker: true },
	FOR_PUPILS: { route: `/${ROUTE_PARTS.forPupils}`, showInContentPicker: true },
	LOGGED_IN_HOME: { route: `/${ROUTE_PARTS.loggedInHome}`, showInContentPicker: true },
	ITEM: {
		route: `/${ROUTE_PARTS.item}/:id`,
		regexp: `/${ROUTE_PARTS.item}/[^/?]+`,
		showInContentPicker: false,
	},
	SEARCH: { route: `/${ROUTE_PARTS.search}`, showInContentPicker: true },
	WORKSPACE: { route: `/${ROUTE_PARTS.workspace}`, showInContentPicker: true },
	WORKSPACE_TAB: {
		route: `/${ROUTE_PARTS.workspace}/:tabId`,
		regexp: `/${ROUTE_PARTS.workspace}/[^/?]+`,
		showInContentPicker: false,
	},
	WORKSPACE_COLLECTIONS: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.collections}`,
		showInContentPicker: true,
	},
	WORKSPACE_BUNDLES: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.bundles}`,
		showInContentPicker: true,
	},
	WORKSPACE_BOOKMARKS: {
		route: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.bookmarks}`,
		showInContentPicker: true,
	},
	SETTINGS: { route: `/${ROUTE_PARTS.settings}`, showInContentPicker: true },
	SETTINGS_TAB: {
		route: `/${ROUTE_PARTS.settings}/:tabId`,
		regexp: `/${ROUTE_PARTS.settings}/[^/?]+`,
		showInContentPicker: false,
	},
	SETTINGS_PROFILE: {
		route: `/${ROUTE_PARTS.settings}/${ROUTE_PARTS.profile}`,
		showInContentPicker: true,
	},
	SETTINGS_ACCOUNT: {
		route: `/${ROUTE_PARTS.settings}/${ROUTE_PARTS.account}`,
		showInContentPicker: true,
	},
	SETTINGS_EMAIL: {
		route: `/${ROUTE_PARTS.settings}/${ROUTE_PARTS.email}`,
		showInContentPicker: true,
	},
	SETTINGS_NOTIFICATIONS: {
		route: `/${ROUTE_PARTS.settings}/${ROUTE_PARTS.notifications}`,
		showInContentPicker: true,
	},
	COMPLETE_PROFILE: { route: `/${ROUTE_PARTS.completeProfile}`, showInContentPicker: true },
	ERROR: { route: `/${ROUTE_PARTS.error}`, showInContentPicker: false },
});

export type RouteId = keyof typeof APP_PATH;

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: APP_PATH.ITEM.route,
	audio: APP_PATH.ITEM.route,
	collectie: APP_PATH.COLLECTION_DETAIL.route,
	bundel: APP_PATH.BUNDLE_DETAIL.route,
};
