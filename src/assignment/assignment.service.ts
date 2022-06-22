import { ApolloQueryResult } from 'apollo-boost';
import { cloneDeep, get, isNil, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';
import { AssignmentContentLabel, AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';

import { ItemsService } from '../admin/items/items.service';
import { getProfileId } from '../authentication/helpers/get-profile-id';
import { CustomError } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import {
	ApolloCacheManager,
	AssignmentLabelsService,
	dataService,
	ToastService,
} from '../shared/services';
import i18n from '../shared/translations/i18n';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './assignment.const';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENTS_BY_OWNER_ID,
	GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID,
	GET_ASSIGNMENT_BLOCKS,
	GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE,
	GET_ASSIGNMENT_BY_UUID,
	GET_ASSIGNMENT_RESPONSES,
	GET_ASSIGNMENT_WITH_RESPONSE,
	INSERT_ASSIGNMENT,
	INSERT_ASSIGNMENT_BLOCKS,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT,
	UPDATE_ASSIGNMENT_RESPONSE_SUBMITTED_STATUS,
} from './assignment.gql';
import {
	AssignmentOverviewTableColumns,
	AssignmentRetrieveError,
	AssignmentSchemaLabel_v2,
} from './assignment.types';

export const GET_ASSIGNMENT_COPY_PREFIX = () =>
	`${i18n.t('assignment/assignment___opdracht-kopie')} %index%: `;
export const GET_ASSIGNMENT_COPY_REGEX = () =>
	new RegExp(`^${i18n.t('assignment/assignment___opdracht-kopie')} [0-9]+`, 'gi');

export class AssignmentService {
	static async fetchAssignments(
		canEditAssignments: boolean,
		user: Avo.User.User,
		pastDeadline: boolean | null,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: string,
		page: number,
		filterString: string | undefined,
		labelIds: string[] | undefined,
		classIds: string[] | undefined
	): Promise<{
		assignments: Avo.Assignment.Assignment[];
		count: number;
	}> {
		let variables: any;
		try {
			const trimmedFilterString = filterString && filterString.trim();
			const filterArray: any[] = [];
			if (trimmedFilterString) {
				filterArray.push({
					_or: [
						{ title: { _ilike: `%${trimmedFilterString}%` } },
						{
							labels: {
								assignment_label: { label: { _ilike: `%${trimmedFilterString}%` } },
							},
						},
						{ assignment_type: { _ilike: `%${trimmedFilterString}%` } },
					],
				});
			}
			if (labelIds && labelIds.length) {
				filterArray.push({
					labels: { assignment_label_id: { _in: labelIds } },
				});
			}
			if (classIds && classIds.length) {
				filterArray.push({
					labels: { assignment_label_id: { _in: classIds } },
				});
			}
			if (!isNil(pastDeadline)) {
				if (pastDeadline) {
					filterArray.push({
						deadline_at: { _lt: new Date().toISOString() },
					});
				} else {
					filterArray.push({
						_or: [
							{ deadline_at: { _gt: new Date().toISOString() } },
							{ deadline_at: { _is_null: true } },
						],
					});
				}
			}
			variables = {
				order: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
				owner_profile_id: getProfileId(user),
				offset: page * ITEMS_PER_PAGE,
				limit: ITEMS_PER_PAGE,
				filter: filterArray.length ? filterArray : {},
			};
			const assignmentQuery = {
				variables,
				query: canEditAssignments
					? GET_ASSIGNMENTS_BY_OWNER_ID
					: GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID,
			};

			// Get the assignment from graphql
			const response: ApolloQueryResult<any> = await dataService.query(assignmentQuery);
			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignmentResponse = get(response, 'data');

			if (
				!assignmentResponse ||
				(!assignmentResponse.app_assignments_v2 &&
					!assignmentResponse.app_assignment_responses) ||
				!assignmentResponse.count
			) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			return {
				assignments: get(assignmentResponse, 'app_assignments_v2', []),
				count: get(assignmentResponse, 'count.aggregate.count', 0),
			};
		} catch (err) {
			throw new CustomError('Failed to fetch assignments from database', err, {
				user,
				variables,
				query: canEditAssignments
					? 'GET_ASSIGNMENTS_BY_OWNER_ID'
					: 'GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID',
			});
		}
	}

	static async fetchAssignmentById(assignmentId: string): Promise<Avo.Assignment.Assignment_v2> {
		try {
			const assignmentQuery = {
				query: GET_ASSIGNMENT_BY_UUID,
				variables: { id: assignmentId },
			};

			// Get the assignment from graphql
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
				assignmentQuery
			);

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignmentResponse: Avo.Assignment.Assignment_v2 | undefined = get(
				response,
				'data.app_assignments_v2[0]'
			);

			if (!assignmentResponse) {
				throw new CustomError('Response does not contain any assignment response', null, {
					assignmentResponse,
				});
			}

			return assignmentResponse;
		} catch (err) {
			throw new CustomError('Failed to get assignment by id from database', err, {
				assignmentId,
				query: 'GET_ASSIGNMENT_BY_UUID',
			});
		}
	}

	static async fetchAssignmentBlocks(assignmentId: string): Promise<Avo.Assignment.Block[]> {
		const blocks = await dataService.query({
			query: GET_ASSIGNMENT_BLOCKS,
			variables: { assignmentId },
		});
		return get(blocks, 'data.app_assignment_blocks_v2', []);
	}

	static async fetchAssignmentByContentIdAndType(
		contentId: string,
		contentType: AssignmentContentLabel
	): Promise<Partial<Avo.Assignment.Assignment>[]> {
		try {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE,
				variables: { contentId, contentType },
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignments: Avo.Assignment.Assignment[] | undefined = get(
				response,
				'data.app_assignments'
			);

			if (!assignments) {
				throw new CustomError('Response does not contain any assignments', null, {
					response,
				});
			}

			return assignments;
		} catch (err) {
			throw new CustomError(
				'Failed to get assignment by content id and content type from database',
				err,
				{
					contentId,
					contentType,
					query: 'GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE',
				}
			);
		}
	}

	/**
	 * Helper functions for inserting, updating, validating and deleting assignment
	 * This will be used by the Assignments view and the AssignmentEdit view
	 * @param assignment
	 */
	private static transformAssignment(
		assignment: Partial<Avo.Assignment.Assignment_v2>
	): Avo.Assignment.Assignment_v2 {
		const assignmentToSave = cloneDeep(assignment);

		if (assignmentToSave.answer_url && !/^(https?:)?\/\//.test(assignmentToSave.answer_url)) {
			assignmentToSave.answer_url = `//${assignmentToSave.answer_url}`;
		}

		assignmentToSave.owner_profile_id = assignmentToSave.owner_profile_id || 'owner_profile_id';
		assignmentToSave.is_deleted = assignmentToSave.is_deleted || false;
		assignmentToSave.is_collaborative = assignmentToSave.is_collaborative || false;
		assignmentToSave.description =
			(assignmentToSave as any).descriptionRichEditorState &&
			(assignmentToSave as any).descriptionRichEditorState.toHTML
				? (assignmentToSave as any).descriptionRichEditorState.toHTML()
				: assignmentToSave.description || '';

		delete (assignmentToSave as any).responses;
		delete (assignmentToSave as any).labels;
		delete (assignmentToSave as any).__typename;
		delete (assignmentToSave as any).descriptionRichEditorState;

		return assignmentToSave as Avo.Assignment.Assignment_v2;
	}

	static async deleteAssignment(assignmentId: string) {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENT,
				variables: { assignmentId },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment', err, { assignmentId });
			console.error(error);
			throw error;
		}
	}

	static async updateAssignment(
		assignment: Partial<Avo.Assignment.Assignment_v2>,
		initialLabels?: Pick<AssignmentLabel_v2, 'id'>[],
		updatedLabels?: Pick<AssignmentLabel_v2, 'id'>[]
	): Promise<Avo.Assignment.Assignment_v2 | null> {
		try {
			if (isNil(assignment.id)) {
				throw new CustomError(
					'Failed to update assignment because its id is undefined',
					null,
					assignment
				);
			}

			assignment.updated_at = new Date().toISOString();

			const assignmentToSave = AssignmentService.transformAssignment({
				...assignment,
			});

			AssignmentService.warnAboutDeadlineInThePast(assignmentToSave);

			const response = await dataService.mutate<Avo.Assignment.Assignment>({
				mutation: UPDATE_ASSIGNMENT,
				variables: {
					assignmentId: assignment.id,
					assignment: assignmentToSave,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (!response || !response.data || (response.errors && response.errors.length)) {
				console.error('assignment update returned empty response', response);
				throw new CustomError('Het opslaan van de opdracht is mislukt', null, { response });
			}

			if (initialLabels && updatedLabels) {
				// Update labels
				const initialLabelIds = initialLabels.map((labelObj) => labelObj.id);
				const updatedLabelIds = updatedLabels.map((labelObj) => labelObj.id);

				const newLabelIds = without(updatedLabelIds, ...initialLabelIds);
				const deletedLabelIds = without(initialLabelIds, ...updatedLabelIds);

				await Promise.all([
					AssignmentLabelsService.linkLabelsFromAssignment(assignment.id, newLabelIds),
					AssignmentLabelsService.unlinkLabelsFromAssignment(
						assignment.id,
						deletedLabelIds
					),
				]);
			}

			return assignment as Avo.Assignment.Assignment_v2;
		} catch (err) {
			const error = new CustomError('Failed to update assignment', err, {
				updatedLabels,
				initialLabels,
				assignment,
			});
			console.error(error);
			throw error;
		}
	}

	static async toggleAssignmentResponseSubmitStatus(
		id: number | string,
		submittedAt: string | null
	): Promise<void> {
		try {
			const response = await dataService.mutate<Avo.Assignment.Assignment>({
				mutation: UPDATE_ASSIGNMENT_RESPONSE_SUBMITTED_STATUS,
				variables: {
					id,
					submittedAt,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Graphql response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError(
				'Failed to toggle submitted at status for assignment response',
				err,
				{
					id,
					submittedAt,
				}
			);
		}
	}

	static async insertAssignment(
		assignment: Partial<Avo.Assignment.Assignment_v2>,
		addedLabels?: AssignmentSchemaLabel_v2[]
	): Promise<Avo.Assignment.Assignment_v2 | null> {
		try {
			const assignmentToSave = AssignmentService.transformAssignment({
				...assignment,
			});

			AssignmentService.warnAboutDeadlineInThePast(assignmentToSave);

			const response = await dataService.mutate<Avo.Assignment.Assignment_v2>({
				mutation: INSERT_ASSIGNMENT,
				variables: {
					assignment: assignmentToSave,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			const assignmentId = get(response, 'data.insert_app_assignments_v2.returning[0].id');

			if (isNil(assignmentId)) {
				throw new CustomError(
					'Saving the assignment failed, response id was undefined',
					null,
					{
						response,
					}
				);
			}

			if (addedLabels) {
				// Update labels
				const addedLabelIds = addedLabels.map((item) => item.assignment_label.id);

				await Promise.all([
					AssignmentLabelsService.linkLabelsFromAssignment(assignmentId, addedLabelIds),
				]);
			}

			return {
				...(assignment as Avo.Assignment.Assignment_v2), // Do not copy the auto modified fields from the validation back into the input controls
				id: assignmentId,
			};
		} catch (err) {
			throw new CustomError('Failed to insert assignment', err, { assignment, addedLabels });
		}
	}

	static async duplicateAssignment(
		newTitle: string,
		initialAssignment: Partial<Avo.Assignment.Assignment_v2> | null
	): Promise<Avo.Assignment.Assignment_v2> {
		if (!initialAssignment || !initialAssignment.id) {
			throw new CustomError(
				'Failed to copy assignment because the duplicateAssignment function received an empty assignment',
				null,
				{ newTitle, initialAssignment }
			);
		}

		// clone the assignment
		const newAssignment = {
			...cloneDeep(initialAssignment),
			title: newTitle,
			deadline_at: null,
		};

		delete newAssignment.id;
		newAssignment.updated_at = new Date().toISOString();

		const duplicatedAssignment = await AssignmentService.insertAssignment(newAssignment);

		if (!duplicatedAssignment) {
			throw new CustomError(
				'Failed to copy assignment because the insert method returned null',
				null,
				{
					newTitle,
					initialAssignment,
				}
			);
		}

		const blocks = await AssignmentService.fetchAssignmentBlocks(initialAssignment.id);
		await AssignmentService.copyBlocksToAssignment(blocks, duplicatedAssignment.id);

		return duplicatedAssignment;
	}

	static async copyBlocksToAssignment(
		blocks: Avo.Assignment.Block[],
		assignmentId: string
	): Promise<void> {
		if (!blocks || !blocks.length) {
			return;
		}
		try {
			const newBlocks = blocks.map((block) => {
				// clone the block
				const newBlock: Partial<Avo.Assignment.Block> = {
					...cloneDeep(block),
					assignment_id: assignmentId,
				};

				delete newBlock.id;
				newBlock.updated_at = new Date().toISOString();

				return newBlock;
			});

			await dataService.mutate({
				mutation: INSERT_ASSIGNMENT_BLOCKS,
				variables: {
					assignmentBlocks: newBlocks,
				},
			});
		} catch (err) {
			throw new CustomError('Failed to copy assignment blocks', err, {
				blocks,
				query: 'INSERT_ASSIGNMENT_BLOCKS',
			});
		}
	}

	private static warnAboutDeadlineInThePast(assignment: Avo.Assignment.Assignment_v2) {
		// Validate if deadline_at is not in the past
		if (assignment.deadline_at && new Date(assignment.deadline_at) < new Date(Date.now())) {
			ToastService.info([
				i18n.t('assignment/assignment___de-ingestelde-deadline-ligt-in-het-verleden'),
				i18n.t(
					'assignment/assignment___de-leerlingen-zullen-dus-geen-toegang-hebben-tot-deze-opdracht'
				),
			]);
		}
	}

	static async fetchAssignmentAndContent(
		pupilProfileId: string,
		assignmentId: string
	): Promise<
		| {
				assignmentBlocks: Avo.Assignment.Block[];
				assignment: Avo.Assignment.Assignment_v2;
		  }
		| AssignmentRetrieveError
	> {
		try {
			// Load assignment
			const response: ApolloQueryResult<Avo.Assignment.Assignment> = await dataService.query({
				query: GET_ASSIGNMENT_WITH_RESPONSE,
				variables: {
					assignmentId,
					pupilUuid: pupilProfileId,
				},
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, response);
			}

			const tempAssignment: Avo.Assignment.Assignment_v2 | undefined | null = get(
				response,
				'data.assignments[0]'
			);

			if (!tempAssignment) {
				throw new CustomError('Failed to find assignment by id');
			}

			// Load content (collection, item or search query) according to assignment
			const initialAssignmentBlocks = await AssignmentService.fetchAssignmentBlocks(
				assignmentId
			);
			const assignmentBlocks = await Promise.all(
				initialAssignmentBlocks.map(async (block: Avo.Assignment.Block) => {
					if (block.type === 'ITEM') {
						block.item = await ItemsService.fetchItemByExternalId(block.fragment_id);
					}
					return block;
				})
			);

			return {
				assignmentBlocks,
				assignment: tempAssignment,
			};
		} catch (err) {
			const graphqlError = get(err, 'graphQLErrors[0].message');
			if (graphqlError) {
				return graphqlError;
			}

			throw new CustomError('Failed to fetch assignment with content', err, {
				pupilProfileId,
				assignmentId,
			});
		}
	}

	static isOwnerOfAssignment(
		assignment: Avo.Assignment.Assignment_v2,
		user: Avo.User.User | undefined
	) {
		return getProfileId(user) === assignment.owner_profile_id;
	}

	static async getAssignmentResponses(
		profileId: string,
		assignmentId: string
	): Promise<string[]> {
		try {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: GET_ASSIGNMENT_RESPONSES,
				variables: { profileId, assignmentId },
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			return (get(response, 'data.app_assignment_responses_v2') || []).map(
				(response: { id: string }) => response.id
			);
		} catch (err) {
			throw new CustomError('Failed to get assignment responses from database', err, {
				profileId,
				query: 'GET_ASSIGNMENT_RESPONSES',
			});
		}
	}

	/**
	 * If the creation of the assignment response fails, we'll still continue with getting the assignment content
	 * @param assignment assignment is passed since the tempAssignment has not been set into the state yet,
	 * since we might need to get the assignment content as well and
	 * this looks cleaner if everything loads at once instead of staggered
	 * @param user
	 */
	static async createAssignmentResponseObject(
		assignment: Avo.Assignment.Assignment_v2,
		user: Avo.User.User | undefined
	): Promise<Avo.Assignment.Response | null> {
		try {
			if (!user) {
				return null;
			}
			if (AssignmentService.isOwnerOfAssignment(assignment, user)) {
				return null;
			}
			const existingAssignmentResponses: string[] = await AssignmentService.getAssignmentResponses(
				get(user, 'profile.id'),
				(get(assignment, 'id') as unknown) as string
			);

			if (!!existingAssignmentResponses.length) {
				if (existingAssignmentResponses.length > 1) {
					console.error(
						new CustomError(
							'Detected multiple assignment responses for the same user and the same assignment',
							null,
							{ existingAssignmentResponses }
						)
					);
				}
				return null;
			}

			// Student has never viewed this assignment before, we should create a response object for him
			const assignmentResponse: Partial<Avo.Assignment.Response_v2> = {
				owner_profile_ids: [getProfileId(user)],
				assignment_id: assignment.id,
				collection_title: null,
			};
			const response = await dataService.mutate({
				mutation: INSERT_ASSIGNMENT_RESPONSE,
				variables: {
					assignmentResponses: [assignmentResponse],
				},
			});

			if (response.errors) {
				throw new CustomError('Response contains Graphql errors', null, {
					response,
				});
			}

			const insertedAssignmentResponse: Avo.Assignment.Response | undefined = get(
				response,
				'data.insert_app_assignment_responses_v2.returning[0]'
			);

			if (isNil(insertedAssignmentResponse)) {
				throw new CustomError(
					'Response from graphql does not contain an assignment response',
					null,
					{ response }
				);
			}

			return insertedAssignmentResponse;
		} catch (err) {
			throw new CustomError('Failed to insert an assignment response in the database', err, {
				assignment,
			});
		}
	}
}
