import { fetchWithLogout } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers';

export interface MinimalClientEvent {
	action: Avo.EventLogging.Action;
	object: string; // entity being modified
	object_type: Avo.EventLogging.ObjectType;
	resource?: Record<string, string | string[] | boolean | number | Avo.Search.DateRange>;
}

export function trackEvents(
	events: MinimalClientEvent[] | MinimalClientEvent,
	user: Avo.User.User | Avo.User.CommonUser | null | undefined
): void {
	try {
		let eventsArray: MinimalClientEvent[];

		if (Array.isArray(events)) {
			eventsArray = events;
		} else {
			eventsArray = [events];
		}

		const eventLogEntries = eventsArray.map(
			(event: MinimalClientEvent): Avo.EventLogging.Event => {
				return {
					occurred_at: new Date().toISOString(),
					source_url: window.location.origin + window.location.pathname, // url when the event was triggered
					subject:
						(user as Avo.User.User)?.profile?.id ??
						(user as Avo.User.CommonUser)?.profileId ??
						'anonymous', // Entity making causing the event
					subject_type: 'user',
					source_querystring: window.location.search,
					...event,
					message: '', // AVO-1675: message should be anonymous and is redundant: leave it empty
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
