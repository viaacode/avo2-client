import { compact, findLast, fromPairs, get, last } from 'lodash-es';

import { InteractiveTourStep } from '../../admin/interactive-tour/interactive-tour.types';
import { APP_PATH } from '../../constants';
import { CustomError } from '../helpers';

import { dataService } from './data-service';
import {
	GET_INTERACTIVE_TOUR,
	GET_NOTIFICATION_INTERACTIVE_TOUR_SEEN,
	INSERT_NOTIFICATION_INTERACTIVE_TOUR_SEEN,
	UPDATE_NOTIFICATION_INTERACTIVE_TOUR_SEEN,
} from './interactive-tour-service.gql';

export interface TourInfo {
	id: number;
	steps: InteractiveTourStep[];
	seen: boolean;
}

export class InteractiveTourService {
	/**
	 * Gets interactive tours and their seen statuses in order of creation date
	 * It picks the first interactive tour that the user has not seen yet and returns its steps
	 * If no tour is found that complies with the above rules, then the function returns null
	 * @param routeId
	 * @param profileId
	 * @return promise containing the the tour or null if no tour was found
	 */
	public static async fetchStepsForPage(
		routeId: keyof typeof APP_PATH,
		profileId: string
	): Promise<TourInfo | null> {
		let variables: any;
		try {
			// Get tours and seen statuses from the database
			variables = {
				routeId,
				profileId,
				notificationKeyPrefix: `INTERACTIVE-TOUR___${routeId}___%`,
			};
			const response = await dataService.query({
				variables,
				query: GET_INTERACTIVE_TOUR,
			});
			const tours: Partial<TourInfo>[] = get(response, 'data.app_interactive_tour', null);

			// Convert seen statuses to a dictionary lookup with:
			// key: id of the tour (string)
			// value: seen status (boolean)
			const seenStatuses: { key: string; through_platform: boolean }[] = get(
				response,
				'data.users_notifications',
				[]
			);
			const tourSeenStatuses = fromPairs(
				compact(
					seenStatuses.map(seenStatus => {
						try {
							return [
								last(seenStatus.key.split('___')),
								!seenStatus.through_platform,
							];
						} catch (err) {
							console.error(
								new CustomError(
									'Failed to parse interactive tour id in notification path',
									err,
									{ seenStatus }
								)
							);
							return null; // last part isn't a valid number
						}
					})
				)
			);
			const firstUnseenTour: Partial<TourInfo> | undefined = tours.find(tour => {
				return !tourSeenStatuses[String(tour.id)];
			});

			// Return the first tour the user hasn't seen before
			if (firstUnseenTour && firstUnseenTour.steps && firstUnseenTour.steps.length) {
				return {
					...firstUnseenTour,
					seen: false,
				} as TourInfo;
			}

			// If all tours have been seen, return the last tour the user has seen already,
			// so they can play it again using the interactive tour button
			const lastSeenTour = findLast(tours, tour => tour.steps && tour.steps.length) as
				| Partial<TourInfo>
				| undefined;

			if (lastSeenTour) {
				return {
					...lastSeenTour,
					seen: true,
				} as TourInfo;
			}

			return null;
		} catch (err) {
			throw new CustomError('Failed to get interactive tour from the database', err, {
				routeId,
				profileId,
				variables,
				query: 'GET_INTERACTIVE_TOUR',
			});
		}
	}

	/**
	 * INSERTS or UPDATES the notifications table entry to track that the tour has been seen by the user
	 * @param routeId
	 * @param profileId
	 * @param interactiveTourId
	 */
	public static async setInteractiveTourSeen(
		routeId: keyof typeof APP_PATH,
		profileId: string,
		interactiveTourId: number
	): Promise<void> {
		let variables: any;
		try {
			variables = {
				profileId,
				key: `INTERACTIVE-TOUR___${routeId}___${interactiveTourId}`,
			};
			const getResponse = await dataService.query({
				variables,
				query: GET_NOTIFICATION_INTERACTIVE_TOUR_SEEN,
			});
			const notificationEntryExists: boolean = !!get(
				getResponse,
				'data.users_notifications[0]'
			);
			// If entry already exists => update existing entry
			// If no entry exists in the notifications table => insert a new entry
			const mutation = notificationEntryExists
				? UPDATE_NOTIFICATION_INTERACTIVE_TOUR_SEEN
				: INSERT_NOTIFICATION_INTERACTIVE_TOUR_SEEN;
			const mutateResponse = await dataService.mutate({
				variables,
				mutation,
			});
			if (mutateResponse.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					mutation,
					mutateResponse,
					getResponse,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to mark interactive tour as seen', err, {
				routeId,
				profileId,
				interactiveTourId,
				variables,
				query: 'INSERT_NOTIFICATION_INTERACTIVE_TOUR_SEEN',
			});
		}
	}
}
