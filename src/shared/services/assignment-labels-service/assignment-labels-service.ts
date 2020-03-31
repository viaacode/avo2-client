import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../helpers';
import { dataService } from '../data-service';
import { ASSIGNMENT_LABELS_RESULT_PATH } from './assignment-labels-service.const';
import { GET_ASSIGNMENT_LABELS } from './assignment-labels-service.gql';

export class AssignmentLabelsService {
	public static async getAll(): Promise<Avo.Assignment.Tag[] | null> {
		try {
			const response = await dataService.query({ query: GET_ASSIGNMENT_LABELS });
			const data = get(response, ['data', ASSIGNMENT_LABELS_RESULT_PATH.GET], null);

			return data;
		} catch (err) {
			console.error(new CustomError('Failed to get assignment labels', err));
			return null;
		}
	}
}
