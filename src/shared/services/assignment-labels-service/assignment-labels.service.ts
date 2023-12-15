import { type Avo } from '@viaa/avo2-types';
import { omit } from 'lodash-es';

import { AssignmentLabelColor } from '../../../assignment/assignment.types';
import {
	DeleteAssignmentLabelsMutation,
	DeleteAssignmentLabelsMutationVariables,
	GetAllAssignmentLabelColorsQuery,
	GetAllAssignmentLabelColorsQueryVariables,
	GetAssignmentLabelsByProfileIdQuery,
	GetAssignmentLabelsByProfileIdQueryVariables,
	GetAssignmentLabelsQuery,
	GetAssignmentLabelsQueryVariables,
	InsertAssignmentLabelsMutation,
	InsertAssignmentLabelsMutationVariables,
	UpdateAssignmentLabelsMutation,
	UpdateAssignmentLabelsMutationVariables,
} from '../../generated/graphql-db-operations';
import {
	DeleteAssignmentLabelsDocument,
	GetAllAssignmentLabelColorsDocument,
	GetAssignmentLabelsByProfileIdDocument,
	GetAssignmentLabelsDocument,
	InsertAssignmentLabelsDocument,
	UpdateAssignmentLabelsDocument,
} from '../../generated/graphql-db-react-query';
import {
	App_Assignment_Labels_V2_Insert_Input,
	Lookup_Enum_Colors_Enum,
} from '../../generated/graphql-db-types';
import { CustomError } from '../../helpers';
import { dataService } from '../data-service';

export class AssignmentLabelsService {
	public static async getLabelsForProfile(
		profileId: string,
		type?: string
	): Promise<Avo.Assignment.Label[]> {
		try {
			const response = await dataService.query<
				GetAssignmentLabelsByProfileIdQuery,
				GetAssignmentLabelsByProfileIdQueryVariables
			>({
				query: GetAssignmentLabelsByProfileIdDocument,
				variables: {
					profileId,
					filters: [...(type ? [{ type: { _eq: type } }] : [])],
				},
			});

			return (response.app_assignment_labels_v2 || []) as Avo.Assignment.Label[];
		} catch (err) {
			throw new CustomError('Failed to get assignment labels', err, {
				profileId,
				query: 'GET_ASSIGNMENT_LABELS_BY_PROFILE_ID',
			});
		}
	}

	public static async getLabels(): Promise<Avo.Assignment.Label[]> {
		try {
			const response = await dataService.query<
				GetAssignmentLabelsQuery,
				GetAssignmentLabelsQueryVariables
			>({
				query: GetAssignmentLabelsDocument,
				variables: {},
			});

			return (response.app_assignment_labels_v2 || []) as Avo.Assignment.Label[];
		} catch (err) {
			throw new CustomError('Failed to get assignment labels', err, {
				query: 'GET_ASSIGNMENT_LABELS',
			});
		}
	}

	public static async insertLabels(labels: Avo.Assignment.Label[]): Promise<number[]> {
		let variables: InsertAssignmentLabelsMutationVariables | null = null;
		try {
			variables = {
				objects: labels.map((labelObj) =>
					omit(labelObj, ['__typename', 'enum_color', 'id'])
				) as App_Assignment_Labels_V2_Insert_Input[],
			};
			const response = await dataService.query<
				InsertAssignmentLabelsMutation,
				InsertAssignmentLabelsMutationVariables
			>({
				query: InsertAssignmentLabelsDocument,
				variables,
			});

			return (response?.insert_app_assignment_labels_v2?.returning || []).map(
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
		colorEnumValue: Lookup_Enum_Colors_Enum
	): Promise<void> {
		let variables: UpdateAssignmentLabelsMutationVariables | null = null;
		try {
			variables = {
				profileId,
				labelId,
				label,
				colorEnumValue,
			};
			await dataService.query<
				UpdateAssignmentLabelsMutation,
				UpdateAssignmentLabelsMutationVariables
			>({
				query: UpdateAssignmentLabelsDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to update assignment label', err, {
				query: 'UPDATE_ASSIGNMENT_LABELS',
				variables,
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
			await dataService.query<
				DeleteAssignmentLabelsMutation,
				DeleteAssignmentLabelsMutationVariables
			>({
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

	public static async getLabelColors(): Promise<AssignmentLabelColor[]> {
		try {
			const response = await dataService.query<
				GetAllAssignmentLabelColorsQuery,
				GetAllAssignmentLabelColorsQueryVariables
			>({
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
