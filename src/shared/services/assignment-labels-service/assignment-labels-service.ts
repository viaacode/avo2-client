import { get, omit } from 'lodash-es';

import { Assignment_Label_v2, AssignmentLabelColor } from '../../../assignment/assignment.types';
import {
	DeleteAssignmentLabelsDocument,
	DeleteAssignmentLabelsMutationVariables,
	GetAllAssignmentLabelColorsDocument,
	GetAllAssignmentLabelColorsQuery,
	GetAssignmentLabelsByProfileIdDocument,
	GetAssignmentLabelsByProfileIdQuery,
	InsertAssignmentLabelsDocument,
	InsertAssignmentLabelsMutation,
	InsertAssignmentLabelsMutationVariables,
	LinkAssignmentLabelsToAssignmentDocument,
	LinkAssignmentLabelsToAssignmentMutation,
	UnlinkAssignmentLabelsFromAssignmentDocument,
	UnlinkAssignmentLabelsFromAssignmentMutation,
	UpdateAssignmentLabelsDocument,
	UpdateAssignmentLabelsMutation,
} from '../../generated/graphql-db-types';
import { CustomError } from '../../helpers';
import { dataService } from '../data-service';

export class AssignmentLabelsService {
	public static async getLabelsForProfile(
		profileId: string,
		type?: string
	): Promise<Assignment_Label_v2[]> {
		try {
			const response = await dataService.query<GetAssignmentLabelsByProfileIdQuery>({
				query: GetAssignmentLabelsByProfileIdDocument,
				variables: {
					profileId,
					type,
				},
			});

			return response.app_assignment_labels_v2 || [];
		} catch (err) {
			throw new CustomError('Failed to get assignment labels', err, {
				profileId,
				query: 'GET_ASSIGNMENT_LABELS_BY_PROFILE_ID',
			});
		}
	}

	public static async insertLabels(labels: Assignment_Label_v2[]): Promise<number[]> {
		let variables: InsertAssignmentLabelsMutationVariables | null = null;
		try {
			variables = {
				objects: labels.map((labelObj) =>
					omit(labelObj, ['__typename', 'enum_color', 'id'])
				),
			};
			const response = await dataService.query<InsertAssignmentLabelsMutation>({
				query: InsertAssignmentLabelsDocument,
				variables,
			});

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
			await dataService.query<UpdateAssignmentLabelsMutation>({
				query: UpdateAssignmentLabelsDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to update assignment label', err, {
				variables,
				query: 'UPDATE_ASSIGNMENT_LABELS',
			});
		}
	}

	public static async deleteLabels(profileId: string, labelIds: string[]): Promise<void> {
		let variables: DeleteAssignmentLabelsMutationVariables | null = null;
		try {
			variables = {
				profileId,
				labelIds,
			};
			await dataService.query<DeleteAssignmentLabelMutation>({
				query: DeleteAssignmentLabelsDocument,
				variables,
			});
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
			await dataService.query<LinkAssignmentLabelsToAssignmentMutation>({
				query: LinkAssignmentLabelsToAssignmentDocument,
				variables,
			});
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
			await dataService.query<UnlinkAssignmentLabelsFromAssignmentMutation>({
				query: UnlinkAssignmentLabelsFromAssignmentDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to unlink assignment labels from assignment', err, {
				variables,
				query: 'UNLINK_ASSIGNMENT_LABELS_FROM_ASSIGNMENT',
			});
		}
	}

	public static async getLabelColors(): Promise<AssignmentLabelColor[]> {
		try {
			const response = await dataService.query<GetAllAssignmentLabelColorsQuery>({
				query: GetAllAssignmentLabelColorsDocument,
			});

			return (response.lookup_enum_colors ?? []) as AssignmentLabelColor[];
		} catch (err) {
			throw new CustomError('Failed to get assignment label colors', err, {
				query: 'GET_ALL_ASSIGNMENT_LABEL_COLORS',
			});
		}
	}
}
