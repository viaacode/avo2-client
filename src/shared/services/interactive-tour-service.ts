import { compact, findLast, forIn, fromPairs, get, last, startsWith, uniqBy } from 'lodash-es';
import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { CustomError, getEnv } from '../helpers';

import { NotificationService } from './notification-service';

export interface TourInfo {
	id: number;
	steps: Avo.InteractiveTour.Step[];
	seen: boolean;
}

export class InteractiveTourService {
	private static routeIds: string[] | null;

	public static async fetchInteractiveTourRouteIds() {
		try {
			if (!this.routeIds) {
				const response = await fetch(`${getEnv('PROXY_URL')}/interactive-tours/route-ids`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.status < 200 && response.status >= 400) {
					throw new CustomError('invalid status code', null, {
						response,
					});
				}
				return await response.json();
			}
		} catch (err) {
			throw new CustomError('Failed to get interactive tour route ids', err);
		}
	}

	/**
	 * Gets interactive tours and their seen statuses in order of creation date
	 * It picks the first interactive tour that the user has not seen yet and returns its steps
	 * If no tour is found that complies with the above rules, then the function returns null
	 * @param routeId
	 * @param profileId
	 * @return promise containing the the tour or null if no tour was found
	 */
	public static async fetchStepsForPage(
		routeId: string,
		profileId: string | undefined
	): Promise<TourInfo | null> {
		try {
			const response = await this.fetchInteractiveTourFromProxy(routeId, profileId);
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
			throw new CustomError('Failed to get interactive tour from the proxy', err, {
				routeId,
				profileId,
			});
		}
	}

	private static async fetchInteractiveTourFromProxy(
		routeId: string,
		profileId: string | undefined
	): Promise<any> {
		try {
			const response = await fetch(
				`${getEnv('PROXY_URL')}/interactive-tours/tour?${queryString.stringify({
					routeId,
					profileId,
				})}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				}
			);
			if (response.status < 200 && response.status >= 400) {
				throw new CustomError('unexpected status code in response', null, {
					response,
				});
			}
			return await response.json();
		} catch (err) {
			throw new CustomError(
				'Failed to get interactive tour and seen statuses by route id from proxy',
				err,
				{ routeId, profileId }
			);
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
				seenStatuses.push({ key, through_platform: false });
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
