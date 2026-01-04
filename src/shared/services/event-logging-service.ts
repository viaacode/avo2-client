import { fetchWithLogout } from '@meemoo/admin-core-ui/client';
import {
  AvoEventLoggingAction,
  AvoEventLoggingEvent,
  AvoEventLoggingObjectType,
  AvoSearchDateRange,
  AvoUserCommonUser,
  AvoUserUser,
} from '@viaa/avo2-types';
import { getEnv } from '../helpers/env';
import { historyLocationsAtom, store } from '../store/ui.store';

export interface MinimalClientEvent {
  action: AvoEventLoggingAction;
  object: string; // entity being modified
  object_type: AvoEventLoggingObjectType;
  resource?: Record<
    string,
    string | string[] | boolean | number | AvoSearchDateRange
  >;
}

export function trackEvents(
  events: MinimalClientEvent[] | MinimalClientEvent,
  user: AvoUserUser | AvoUserCommonUser | null | undefined,
): void {
  try {
    let eventsArray: MinimalClientEvent[];

    if (Array.isArray(events)) {
      eventsArray = events;
    } else {
      eventsArray = [events];
    }

    const eventLogEntries = eventsArray.map(
      (event: MinimalClientEvent): AvoEventLoggingEvent => {
        const eventHistory = store.get(historyLocationsAtom) || [];
        return {
          occurred_at: new Date().toISOString(),
          source_url: window.location.origin + window.location.pathname, // url when the event was triggered
          subject:
            (user as AvoUserUser)?.profile?.id ??
            (user as AvoUserCommonUser)?.profileId ??
            'anonymous', // Entity making causing the event
          subject_type: 'user',
          source_querystring: window.location.search,
          ...event,
          message: '', // AVO-1675: message should be anonymous and is redundant: leave it empty
          resource: {
            ...event.resource,
            history: eventHistory,
          },
        };
      },
    );

    // No await, since we never want to block the program from continuing
    // because something is wrong with the event tracking
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
