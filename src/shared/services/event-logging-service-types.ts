export const SEARCH_EVENT_NAMES = {
	search: 'search',
};

export const ITEM_EVENT_NAMES = {
	publish: 'publish',
	unpublish: 'unpublish',
	view: 'view',
	play: 'play',
	edit: 'edit',
	copy: 'copy',
	add_to_collection: 'add_to_collection',
	bookmark: 'bookmark',
	information_request: 'information_request',
	report: 'report',
	share: 'share',
	create: 'create',
};

export const ACCOUNT_EVENT_NAMES = {
	block: 'block',
	unblock: 'unblock',
	login: 'login',
	edit: 'edit',
	password_reset: 'password_reset',
	delete: 'delete',
};

export interface ClientEvent {
	name: EventName;
	category: EventCategory;
	event_subject: {
		type: 'user' | 'system';
		identifier: string;
	}; // entity doing the modification
	event_object: {
		type: 'item' | 'collection' | 'bundle' | 'user';
		identifier: string;
	}; // entity being modified
	event_message: any; // user played item xxx on avo
	event_timestamp: string;
	event_source: string; // eg: url when the event was triggered
}

export type EventName =
	| keyof typeof SEARCH_EVENT_NAMES
	| keyof typeof ITEM_EVENT_NAMES
	| keyof typeof ACCOUNT_EVENT_NAMES;

export type EventCategory = 'item' | 'user' | 'search';
