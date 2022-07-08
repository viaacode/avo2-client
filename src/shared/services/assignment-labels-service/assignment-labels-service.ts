import { get, omit } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { AssignmentLabelColor } from '../../../assignment/assignment.types';
import { CustomError } from '../../helpers';
import { ApolloCacheManager, dataService } from '../data-service';

import {
	DELETE_ASSIGNMENT_LABELS,
	GET_ALL_ASSIGNMENT_LABEL_COLORS,
	GET_ASSIGNMENT_LABELS_BY_PROFILE_ID,
	INSERT_ASSIGNMENT_LABELS,
	LINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT,
	UNLINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT,
	UPDATE_ASSIGNMENT_LABEL,
} from './assignment-labels-service.gql';

export class AssignmentLabelsService {
	public static async getLabelsForProfile(
		profileId: string,
		type?: string
	): Promise<Avo.Assignment.Label_v2[]> {
		try {
			const response = await dataService.query({
				query: GET_ASSIGNMENT_LABELS_BY_PROFILE_ID,
				variables: {
					profileId,
					type,
				},
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			return get(response, 'data.app_assignment_labels_v2', []);
		} catch (err) {
			throw new CustomError('Failed to get assignment labels', err, {
				profileId,
				query: 'GET_ASSIGNMENT_LABELS_BY_PROFILE_ID',
			});
		}
	}

	public static async insertLabels(labels: Avo.Assignment.Label_v2[]): Promise<number[]> {
		let variables;
		try {
			variables = {
				objects: labels.map((labelObj) =>
					omit(labelObj, ['__typename', 'enum_color', 'id'])
				),
			};
			const response = await dataService.mutate({
				variables,
				mutation: INSERT_ASSIGNMENT_LABELS,
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			return get(response, 'insert_app_assignment_labels.returning', []).map(
				(label: any) => label.id
			);
		} catch (err) {
			throw new CustomError('Failed to insert assignment labels', err, {
				variables,
				query: 'INSERT_ASSIGNMENT_LABELS',
			});
		}
	}

	public static async updateLabel(
		profileId: string,
		labelId: string,
		label: string,
		colorEnumValue: string
	): Promise<void> {
		let variables;
		try {
			variables = {
				profileId,
				labelId,
				label,
				colorEnumValue,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UPDATE_ASSIGNMENT_LABEL,
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to update assignment label', err, {
				variables,
				query: 'UPDATE_ASSIGNMENT_LABEL',
			});
		}
	}

	public static async deleteLabels(profileId: string, labelIds: string[]): Promise<void> {
		let variables;
		try {
			variables = {
				profileId,
				labelIds,
			};
			const response = await dataService.mutate({
				variables,
				mutation: DELETE_ASSIGNMENT_LABELS,
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to delete assignment labels', err, {
				variables,
				query: 'DELETE_ASSIGNMENT_LABELS',
			});
		}
	}

	public static async linkLabelsFromAssignment(
		assignmentId: string,
		labelIds: string[]
	): Promise<void> {
		let variables;
		try {
			if (!labelIds || !labelIds.length) {
				return;
			}
			variables = {
				objects: labelIds.map((labelId) => ({
					assignment_id: assignmentId,
					assignment_label_id: labelId,
				})),
			};
			const response = await dataService.mutate({
				variables,
				mutation: LINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT,
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to link assignment labels to assignment', err, {
				variables,
				query: 'LINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT',
			});
		}
	}

	public static async unlinkLabelsFromAssignment(
		assignmentUuid: string,
		labelIds: string[]
	): Promise<void> {
		let variables;
		try {
			if (!labelIds || !labelIds.length) {
				return;
			}
			variables = {
				assignmentUuid,
				labelIds,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UNLINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT,
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to unlink assignment labels from assignment', err, {
				variables,
				query: 'UNLINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT',
			});
		}
	}

	public static async getLabelColors(): Promise<AssignmentLabelColor[]> {
		try {
			const response = await dataService.query({
				query: GET_ALL_ASSIGNMENT_LABEL_COLORS,
			});

			if (response.errors) {
				throw new CustomError('Response contains errors', null, { response });
			}

			return get(response, 'data.lookup_enum_colors', []);
		} catch (err) {
			throw new CustomError('Failed to get assignment label colors', err, {
				query: 'GET_ALL_ASSIGNMENT_LABEL_COLORS',
			});
		}
	}

	public static getLabelsFromAssignment(
		assignment: Partial<Avo.Assignment.Assignment_v2>
	): Avo.Assignment.Label_v2[] {
		return (
			get(assignment, 'tags', []) as {
				assignment_tag: Avo.Assignment.Label_v2;
			}[]
		).map((assignmentLabelLink) => assignmentLabelLink.assignment_tag);
	}
}
