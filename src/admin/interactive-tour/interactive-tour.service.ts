import { Avo } from '@viaa/avo2-types';
import { get, isNil } from 'lodash-es';

import {
	DeleteInteractiveTourDocument,
	DeleteInteractiveTourMutation,
	GetInteractiveTourByIdDocument,
	GetInteractiveTourByIdQuery,
	GetInteractiveToursDocument,
	GetInteractiveToursQuery,
	InsertInteractiveTourDocument,
	InsertInteractiveTourMutation,
	UpdateInteractiveTourDocument,
	UpdateInteractiveTourMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services';

import { ITEMS_PER_PAGE } from './interactive-tour.const';
import {
	EditableStep,
	InteractiveTour,
	InteractiveTourOverviewTableCols,
} from './interactive-tour.types';

export class InteractiveTourService {
	public static async fetchInteractiveTours(
		page: number,
		sortColumn: InteractiveTourOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[GetInteractiveToursQuery['app_interactive_tour'], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query<GetInteractiveToursQuery>({
				variables,
				query: GetInteractiveToursDocument,
			});
			const interactiveTours = response?.app_interactive_tour;
			const interactiveTourCount =
				response?.app_interactive_tour_aggregate?.aggregate?.count || 0;

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
	): Promise<GetInteractiveTourByIdQuery['app_interactive_tour'][0]> {
		let variables: any;
		try {
			variables = {
				id,
			};
			const response = await dataService.query<GetInteractiveTourByIdQuery>({
				variables,
				query: GetInteractiveTourByIdDocument,
			});
			const interactiveTour = response?.app_interactive_tour?.[0];

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

	public static async insertInteractiveTour(interactiveTour: InteractiveTour): Promise<number> {
		try {
			const response = await dataService.query<InsertInteractiveTourMutation>({
				query: InsertInteractiveTourDocument,
				variables: {
					interactiveTour: {
						name: interactiveTour.name,
						page: interactiveTour.page_id, // Renamed page to page_id, because we already have page n the tableState
						steps: interactiveTour.steps,
					} as any,
				},
				update: ApolloCacheManager.clearInteractiveTourCache,
			});
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

	static async updateInteractiveTour(interactiveTour: InteractiveTour): Promise<void> {
		try {
			await dataService.query<UpdateInteractiveTourMutation>({
				query: UpdateInteractiveTourDocument,
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
		} catch (err) {
			throw new CustomError('Failed to update interactive tour in the database', err, {
				interactiveTour,
				query: 'UPDATE_INTERACTIVE_TOUR',
			});
		}
	}

	static async deleteInteractiveTour(interactiveTourId: number): Promise<void> {
		try {
			await dataService.query<DeleteInteractiveTourMutation>({
				query: DeleteInteractiveTourDocument,
				variables: {
					interactiveTourId,
				},
				update: ApolloCacheManager.clearInteractiveTourCache,
			});
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
