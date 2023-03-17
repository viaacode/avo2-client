import {
	GetNotificationDocument,
	GetNotificationQuery,
	GetNotificationQueryVariables,
	InsertNotificationDocument,
	InsertNotificationMutation,
	InsertNotificationMutationVariables,
	UpdateNotificationDocument,
	UpdateNotificationMutation,
	UpdateNotificationMutationVariables,
} from '../generated/graphql-db-types';
import { CustomError } from '../helpers';

import { dataService } from './data-service';

export interface NotificationInfo {
	through_email: boolean;
	through_platform: boolean;
}

export class NotificationService {
	public static async getNotification(
		key: string,
		profileId: string
	): Promise<NotificationInfo | null> {
		try {
			const response = await dataService.query<
				GetNotificationQuery,
				GetNotificationQueryVariables
			>({
				query: GetNotificationDocument,
				variables: {
					key,
					profileId,
				},
			});

			return (response.users_notifications[0] ?? null) as NotificationInfo | null;
		} catch (err) {
			throw new CustomError('Failed to get user notification', err, {
				profileId,
				notificationKey: key,
				query: 'GET_NOTIFICATION',
			});
		}
	}

	public static async setNotification(
		key: string,
		profileId: string,
		throughEmail: boolean,
		throughPlatform: boolean
	): Promise<void> {
		try {
			const notificationEntryExists = !!(await NotificationService.getNotification(
				key,
				profileId
			));
			// If entry already exists => update existing entry
			// If no entry exists in the notifications table => insert a new entry
			const mutation = notificationEntryExists
				? UpdateNotificationDocument
				: InsertNotificationDocument;
			await dataService.query<
				UpdateNotificationMutation | InsertNotificationMutation,
				UpdateNotificationMutationVariables | InsertNotificationMutationVariables
			>({
				query: mutation,
				variables: {
					profileId,
					key,
					throughEmail,
					throughPlatform,
				},
			});
		} catch (err) {
			throw new CustomError('Failed to set user notification', err, {
				profileId,
				throughEmail,
				throughPlatform,
				notificationKey: key,
				query: ['GET_NOTIFICATION', 'UPDATE_NOTIFICATION', 'INSERT_NOTIFICATION'],
			});
		}
	}
}
