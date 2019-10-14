import { getEnv } from '../helpers/env';
import { dataService } from './data-service';
import { INSERT_EVENT_LOG_ENTRY } from './event-logging-service.gql';

type Env = 'local' | 'int' | 'qas' | 'prd';

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
};

export const ACCOUNT_EVENT_NAMES = {
	block: 'block',
	unblock: 'unblock',
	login: 'login',
	edit: 'edit',
	password_reset: 'password_reset',
	delete: 'delete',
};

export interface Event {
	id: string;
	namespace: 'avo';
	component: 'client';
	agent_id: '7680d455-c6ff-42ab-b09c-9487bcc133e0';
	event_label_id: number;
	event_timestamp: string;
	event_subject: {
		type: 'user' | 'system';
		identifier: string;
	}; // entity doing the modification
	event_object: {
		type: 'item' | 'collection' | 'bundle' | 'user';
		identifier: string;
	}; // entity being modified
	event_message: any; // user played item xxx on avo
	event_source: string; // eg: url when the event was triggered
	record_created_at: string; // defaults to now()
	ip: string;
}

export interface ClientEvent {
	name: EventName;
	category: EventCategory;

	event_label_id: number;
	event_timestamp: string;
	event_subject: {
		type: 'user' | 'system';
		identifier: string;
	}; // entity doing the modification
	event_object: {
		type: 'item' | 'collection' | 'bundle' | 'user';
		identifier: string;
	}; // entity being modified
	event_message: any; // user played item xxx on avo
	event_source: string; // eg: url when the event was triggered
	record_created_at: string; // defaults to now()
	ip: string;
}

function getDefaultEventLogEntryFields(): Partial<Event> {
	return {
		namespace: 'avo',
		component: 'client',
		agent_id: '7680d455-c6ff-42ab-b09c-9487bcc133e0', // avo-logger
		// environment: (getEnv('NODE_ENV') || 'prd') as Env,
		event_timestamp: new Date().toISOString(),
		event_source: window.location.href, // url when the event was triggered
	};
}

export type EventName =
	| keyof typeof SEARCH_EVENT_NAMES
	| keyof typeof ITEM_EVENT_NAMES
	| keyof typeof ACCOUNT_EVENT_NAMES;

export type EventCategory = 'item' | 'user' | 'search';

export interface EventLabel {
	id: number;
	name: EventName;
	category: EventCategory;
}

export function trackEvents(events: Partial<Event>[] | Partial<Event>) {
	let eventsArray: Partial<Event>[];
	if (Array.isArray(events)) {
		eventsArray = events;
	} else {
		eventsArray = [events];
	}
	const eventLogEntries = eventsArray.map(
		(event: Partial<Event>): Event => {
			return {
				...getDefaultEventLogEntryFields(),
				...event,
			} as Event;
		}
	);
	dataService
		.mutate({
			mutation: INSERT_EVENT_LOG_ENTRY,
			variables: { eventLogEntries },
		})
		.then(() => {})
		.catch(err => {
			console.error('Failed to log events to database', { eventLogEntries, innerException: err });
		});
}
