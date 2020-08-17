import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

interface MinimalClientEvent {
	action: EventAction;
	object: string; // entity being modified
	object_type: EventObjectType;
	message: any; // user played item xxx on avo
}

// TODO move to typings repo after update to typings v2.22.0
export type EventAction =
	| 'register'
	| 'activate'
	| 'create'
	| 'edit'
	| 'delete'
	| 'request'
	| 'reset'
	| 'authenticate'
	| 'logout'
	| 'send'
	| 'view'
	| 'play'
	| 'bookmark'
	| 'share'
	| 'report'
	| 'publish'
	| 'unpublish'
	| 'copy'
	| 'add_to'
	| 'remove_from';

export interface ClientEvent {
	action: EventAction;
	subject: string; // entity doing the modification
	subject_type: EventSubjectType;
	object: string; // entity being modified
	object_type: EventObjectType;
	message: any; // user played item xxx on avo
	occurred_at: string | null;
	source_url: string; // eg: url when the event was triggered
}

export type EventSubjectType = 'user' | 'system';

export type EventObjectType =
	| 'account'
	| 'profile'
	| 'password'
	| 'user'
	| 'mail'
	| 'information'
	| 'item'
	| 'collection'
	| 'bundle'
	| 'assignment'
	| 'search';

export function trackEvents(
	events: MinimalClientEvent[] | MinimalClientEvent,
	user: Avo.User.User | null | undefined
) {
	try {
		let eventsArray: MinimalClientEvent[];
		if (Array.isArray(events)) {
			eventsArray = events;
		} else {
			eventsArray = [events];
		}
		const eventLogEntries = eventsArray.map(
			(event: MinimalClientEvent): ClientEvent => {
				return {
					occurred_at: new Date().toISOString(),
					source_url: window.location.href, // url when the event was triggered
					subject: get(user, 'profile.id', ''), // Entity making causing the event
					subject_type: 'user',
					...event,
				};
			}
		);
		fetchWithLogout(`${getEnv('PROXY_URL')}/event-logging`, {
			method: 'POST',
			body: JSON.stringify(eventLogEntries),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		}).catch((err: any) => {
			console.error('Failed to log events to database', {
				eventLogEntries,
				innerException: err,
			});
		});
	} catch (err) {
		console.error('Failed to log event to the server', err, { events });
	}
}
