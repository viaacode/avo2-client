import { Avo } from '@viaa/avo2-types';
import { ClientEvent, EventCategory, EventName } from '@viaa/avo2-types/types/event-logging/types';

import { getProfileId } from '../../authentication/helpers/get-profile-info';
import { getEnv } from '../helpers/env';

interface MinimalClientEvent {
	name: EventName;
	category: EventCategory;
	event_object: string; // entity being modified
	event_object_type: Avo.EventLogging.ObjectType;
	event_message: any; // user played item xxx on avo
}

export function trackEvents(events: MinimalClientEvent[] | MinimalClientEvent) {
	let eventsArray: MinimalClientEvent[];
	if (Array.isArray(events)) {
		eventsArray = events;
	} else {
		eventsArray = [events];
	}
	const eventLogEntries = eventsArray.map(
		(event: MinimalClientEvent): ClientEvent => {
			return {
				event_timestamp: new Date().toISOString(),
				event_source: window.location.href, // url when the event was triggered
				event_subject: getProfileId(), // Entity making causing the event
				event_subject_type: 'user_uuid',
				...event,
			} as ClientEvent;
		}
	);
	fetch(`${getEnv('PROXY_URL')}/event-logging`, {
		method: 'POST',
		body: JSON.stringify(eventLogEntries),
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	}).catch((err: any) => {
		console.error('Failed to log events to database', { eventLogEntries, innerException: err });
	});
}
