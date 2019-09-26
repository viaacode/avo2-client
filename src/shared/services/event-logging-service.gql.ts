import { gql } from 'apollo-boost';

export const INSERT_EVENT_LOG_ENTRY = gql`
	mutation insertEventLogEntry($eventLogEntries: [avo_events_insert_input!]!) {
		insert_avo_events(objects: $eventLogEntries) {
			affected_rows
		}
	}
`;
