import { compact, findLast, forIn, fromPairs, get, last, startsWith, uniqBy } from 'lodash-es';

import { InteractiveTourStep } from '../../admin/interactive-tour/interactive-tour.types';
import { APP_PATH } from '../../constants';
import { CustomError } from '../helpers';

import { dataService } from './data-service';
import {
	GET_INTERACTIVE_TOUR_WITH_STATUSES,
	GET_INTERACTIVE_TOUR_WITHOUT_STATUSES,
} from './interactive-tour-service.gql';
import { NotificationService } from './notification-service';

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
		profileId: string | undefined
	): Promise<TourInfo | null> {
		let variables: any;
		try {
			let response: any;
			if (profileId) {
				// Get tours and seen statuses from the database
				variables = {
					routeId,
					profileId,
					notificationKeyPrefix: `INTERACTIVE-TOUR___${routeId}___%`,
				};

				response = await dataService.query({
					variables,
					query: GET_INTERACTIVE_TOUR_WITH_STATUSES,
				});
			} else {
				variables = {
					routeId,
				};

				response = await dataService.query({
					variables,
					query: GET_INTERACTIVE_TOUR_WITHOUT_STATUSES,
				});
			}
			const tours: Partial<TourInfo>[] = get(response, 'data.app_interactive_tour', null);

			const seenStatuses: { key: string; through_platform: boolean }[] = this.getSeenStatuses(
				routeId,
				response
			);

			// Convert seen statuses to a dictionary lookup with:
			// key: id of the tour (string)
			// value: seen status (boolean)
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
	 * Returns a single list of seen statuses by combining the seen statuses from the database and the ones from localstorage
	 * The ones in the database were stored when the user was logged in and viewed an interactive tour
	 * The ones in local storage were stored when the user was not logged in and viewed an interactive tour
	 * @param routeId
	 * @param response
	 */
	private static getSeenStatuses(
		routeId: string | number,
		response: any
	): { key: string; through_platform: boolean }[] {
		const seenStatuses: { key: string; through_platform: boolean }[] = get(
			response,
			'data.users_notifications',
			[]
		);
		const seenTourKeyPrefix = `INTERACTIVE-TOUR___${routeId}___`;
		// @ts-ignore
		forIn(localStorage, (value: string, key: string) => {
			if (startsWith(key, seenTourKeyPrefix)) {
				seenStatuses.push({ key, through_platform: true });
			}
		});
		return uniqBy(seenStatuses, status => status.key);
	}

	/**
	 * INSERTS or UPDATES the notifications table entry to track that the tour has been seen by the user
	 * @param routeId
	 * @param profileId
	 * @param interactiveTourId
	 */
	public static async setInteractiveTourSeen(
		routeId: keyof typeof APP_PATH,
		profileId: string | undefined,
		interactiveTourId: number
	): Promise<void> {
		try {
			const key = `INTERACTIVE-TOUR___${routeId}___${interactiveTourId}`;
			if (profileId) {
				await NotificationService.setNotification(key, profileId, false, false);
			} else {
				localStorage.setItem(key, 'seen');
			}
		} catch (err) {
			throw new CustomError('Failed to mark interactive tour as seen', err, {
				routeId,
				profileId,
				interactiveTourId,
				query: 'INSERT_NOTIFICATION_INTERACTIVE_TOUR_SEEN',
			});
		}
	}
}
