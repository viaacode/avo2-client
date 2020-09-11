import { get, isNil } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services';

import { ITEMS_PER_PAGE } from './interactive-tour.const';
import {
	DELETE_INTERACTIVE_TOUR,
	GET_INTERACTIVE_TOURS,
	GET_INTERACTIVE_TOUR_BY_ID,
	INSERT_INTERACTIVE_TOUR,
	UPDATE_INTERACTIVE_TOUR,
} from './interactive-tour.gql';
import { EditableStep, InteractiveTourOverviewTableCols } from './interactive-tour.types';

export class InteractiveTourService {
	public static async fetchInteractiveTours(
		page: number,
		sortColumn: InteractiveTourOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[Avo.InteractiveTour.InteractiveTour[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query({
				variables,
				query: GET_INTERACTIVE_TOURS,
			});
			const interactiveTours = get(response, 'data.app_interactive_tour');
			const interactiveTourCount = get(
				response,
				'data.app_interactive_tour_aggregate.aggregate.count'
			);

			if (!interactiveTours) {
				throw new CustomError('Response does not contain any interactive tours', null, {
					response,
				});
			}

			return [interactiveTours, interactiveTourCount];
		} catch (err) {
			throw new CustomError('Failed to get interactive tours from the database', err, {
				variables,
				query: 'GET_INTERACTIVE_TOURS',
			});
		}
	}

	public static async fetchInteractiveTour(
		id: string
	): Promise<Avo.InteractiveTour.InteractiveTour> {
		let variables: any;
		try {
			variables = {
				id,
			};
			const response = await dataService.query({
				variables,
				query: GET_INTERACTIVE_TOUR_BY_ID,
			});
			const interactiveTour = get(response, 'data.app_interactive_tour[0]');

			if (!interactiveTour) {
				throw new CustomError('Response does not contain an interactiveTour', null, {
					response,
				});
			}

			return interactiveTour;
		} catch (err) {
			throw new CustomError('Failed to get the interactiveTour from the database', err, {
				variables,
				query: 'GET_INTERACTIVE_TOUR_BY_ID',
			});
		}
	}

	public static async insertInteractiveTour(
		interactiveTour: Avo.InteractiveTour.InteractiveTour
	): Promise<number> {
		try {
			const response = await dataService.mutate({
				mutation: INSERT_INTERACTIVE_TOUR,
				variables: {
					interactiveTour: {
						name: interactiveTour.name,
						page: interactiveTour.page_id, // Renamed page to page_id, because we already have page n the tableState
						steps: interactiveTour.steps,
					} as any,
				},
				update: ApolloCacheManager.clearInteractiveTourCache,
			});
			if (response.errors) {
				throw new CustomError('Failed to insert interactive tour in the database', null, {
					response,
					errors: response.errors,
				});
			}
			const interactiveTourId = get(
				response,
				'data.insert_app_interactive_tour.returning[0].id'
			);
			if (isNil(interactiveTourId)) {
				throw new CustomError(
					'Response from database does not contain the id of the inserted interactive tour',
					null,
					{ response }
				);
			}
			return interactiveTourId;
		} catch (err) {
			throw new CustomError('Failed to insert interactive tour in the database', err, {
				interactiveTour,
				query: 'INSERT_INTERACTIVE_TOUR',
			});
		}
	}

	static async updateInteractiveTour(interactiveTour: Avo.InteractiveTour.InteractiveTour) {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_INTERACTIVE_TOUR,
				variables: {
					interactiveTour: {
						name: interactiveTour.name,
						page: interactiveTour.page_id,
						steps: interactiveTour.steps,
					} as any,
					interactiveTourId: interactiveTour.id,
				},
				update: ApolloCacheManager.clearInteractiveTourCache,
			});
			if (response.errors) {
				throw new CustomError('Failed to update interactive tour in the database', null, {
					response,
					errors: response.errors,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to update interactive tour in the database', err, {
				interactiveTour,
				query: 'UPDATE_INTERACTIVE_TOUR',
			});
		}
	}

	static async deleteInteractiveTour(interactiveTourId: number) {
		try {
			const response = await dataService.mutate({
				mutation: DELETE_INTERACTIVE_TOUR,
				variables: {
					interactiveTourId,
				},
				update: ApolloCacheManager.clearInteractiveTourCache,
			});
			if (response.errors) {
				throw new CustomError('Failed to delete interactive tour from the database', null, {
					response,
					errors: response.errors,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to delete interactive tour from the database', err, {
				interactiveTourId,
				query: 'DELETE_INTERACTIVE_TOUR',
			});
		}
	}

	public static swapStepPositions(
		steps: EditableStep[],
		currentStapIndex: number,
		delta: number
	): EditableStep[] {
		const currentStep = steps[currentStapIndex];
		steps[currentStapIndex] = steps[currentStapIndex + delta];
		steps[currentStapIndex + delta] = currentStep;

		return steps;
	}
}
