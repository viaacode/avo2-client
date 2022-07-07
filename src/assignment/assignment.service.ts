import { Avo } from '@viaa/avo2-types';
import {
	AssignmentBlock,
	AssignmentContentLabel,
	AssignmentLabel_v2,
	AssignmentSchema_v2,
} from '@viaa/avo2-types/types/assignment';
import { ApolloQueryResult } from 'apollo-boost';
import { cloneDeep, get, isNil, without } from 'lodash-es';

import { ItemsService } from '../admin/items/items.service';
import { getProfileId } from '../authentication/helpers/get-profile-id';
import { ItemTrimInfo } from '../item/item.types';
import { CustomError } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import {
	ApolloCacheManager,
	AssignmentLabelsService,
	dataService,
	ToastService,
} from '../shared/services';
import { VideoStillService } from '../shared/services/video-stills-service';
import i18n from '../shared/translations/i18n';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
	isNewAssignmentBlock,
	ITEMS_PER_PAGE,
	RESPONSE_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './assignment.const';
import {
	BULK_UPDATE_AUTHOR_FOR_ASSIGNMENTS,
	DELETE_ASSIGNMENT,
	DELETE_ASSIGNMENT_RESPONSE,
	DELETE_ASSIGNMENTS,
	GET_ASSIGNMENT_BLOCKS,
	GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE,
	GET_ASSIGNMENT_BY_UUID,
	GET_ASSIGNMENT_IDS,
	GET_ASSIGNMENT_RESPONSES,
	GET_ASSIGNMENT_RESPONSES_BY_ASSIGNMENT_ID,
	GET_ASSIGNMENT_WITH_RESPONSE,
	GET_ASSIGNMENTS_ADMIN_OVERVIEW,
	GET_ASSIGNMENTS_BY_OWNER_ID,
	GET_ASSIGNMENTS_BY_RESPONSE_OWNER_ID,
	GET_MAX_POSITION_ASSIGNMENT_BLOCKS,
	INSERT_ASSIGNMENT,
	INSERT_ASSIGNMENT_BLOCKS,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT,
	UPDATE_ASSIGNMENT_BLOCK,
	UPDATE_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT_RESPONSE_SUBMITTED_STATUS,
} from './assignment.gql';
import {
	AssignmentBlockType,
	AssignmentOverviewTableColumns,
	AssignmentSchemaLabel_v2,
	AssignmentType,
	PupilCollectionFragment,
} from './assignment.types';

export class AssignmentService {
	static async fetchAssignments(
		canEditAssignments: boolean,
		user: Avo.User.User,
		pastDeadline: boolean | null,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		page: number,
		filterString: string | undefined,
		labelIds: string[] | undefined,
		classIds: string[] | undefined,
		limit: number | null = ITEMS_PER_PAGE
	): Promise<{
		assignments: Avo.Assignment.Assignment_v2[];
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
				limit,
				offset: limit === null ? 0 : page * limit,
				order: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
				owner_profile_id: getProfileId(user),
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

			return {
				...assignmentResponse,
				blocks: await Promise.all(
					assignmentResponse.blocks.map(async (block) =>
						block.fragment_id
							? await ItemsService.fetchItemByExternalId(block.fragment_id).then(
									(item) => ({
										...block,
										item,
									})
							  )
							: block
					)
				),
			};
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
	): Promise<Partial<Avo.Assignment.Assignment_v2>[]> {
		try {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE,
				variables: { contentId, contentType },
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignments: Avo.Assignment.Assignment_v2[] | undefined = get(
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
		delete assignmentToSave.blocks;

		return assignmentToSave as Avo.Assignment.Assignment_v2;
	}

	static async deleteAssignment(assignmentId: string): Promise<void> {
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

	static async deleteAssignments(assignmentIds: string[]): Promise<void> {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENTS,
				variables: { assignmentIds },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment', err, { assignmentIds });
			console.error(error);
			throw error;
		}
	}

	static async updateAssignment(
		original: AssignmentSchema_v2,
		update: Partial<AssignmentSchema_v2>
	): Promise<AssignmentSchema_v2 | null> {
		try {
			if (isNil(original.id)) {
				throw new CustomError(
					'Failed to update assignment because its id is undefined',
					null,
					{ original, update }
				);
			}

			AssignmentService.warnAboutDeadlineInThePast(update);
			update.updated_at = new Date().toISOString();

			await AssignmentService.updateAssignmentBlocks(
				original.id,
				original.blocks || [],
				update.blocks || []
			);

			const assignment = AssignmentService.transformAssignment({
				...update,
			});

			delete assignment.owner;

			const response = await dataService.mutate<{
				data: { update_app_assignments_v2: { affected_rows: number } };
			}>({
				mutation: UPDATE_ASSIGNMENT,
				variables: {
					assignment,
					assignmentId: original.id,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (!response || !response.data || (response.errors && response.errors.length)) {
				console.error('assignment update returned empty response', response);
				throw new CustomError('Het opslaan van de opdracht is mislukt', null, { response });
			}

			await this.updateAssignmentLabels(
				original.id,
				original.labels.map(({ assignment_label }) => assignment_label),
				(update.labels || []).map(({ assignment_label }) => assignment_label)
			);

			return {
				...original,
				...update,
			};
		} catch (err) {
			const error = new CustomError('Failed to update assignment', err, {
				original,
				update,
			});

			console.error(error);
			throw error;
		}
	}

	static async updateAssignmentResponse(
		original: Avo.Assignment.Response_v2,
		update: Partial<Avo.Assignment.Response_v2>
	): Promise<Avo.Assignment.Response_v2 | null> {
		try {
			if (isNil(original.id)) {
				throw new CustomError(
					'Failed to update assignment response because its id is undefined',
					null,
					{ original, update }
				);
			}

			const response = await dataService.mutate<{
				data: { update_app_assignment_responses_v2: { affected_rows: number } };
			}>({
				mutation: UPDATE_ASSIGNMENT_RESPONSE,
				variables: {
					collectionTitle: update.collection_title,
					updatedAt: new Date().toISOString(),
					assignmentResponseId: original.id,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (!response || !response.data || (response.errors && response.errors.length)) {
				console.error('assignment update returned empty response', response);
				throw new CustomError('Het opslaan van de opdracht is mislukt', null, { response });
			}

			return {
				...original,
				...update,
			};
		} catch (err) {
			const error = new CustomError('Failed to update assignment', err, {
				original,
				update,
			});

			console.error(error);
			throw error;
		}
	}

	static async updateAssignmentLabels(
		id: string,
		original: AssignmentLabel_v2[],
		update: AssignmentLabel_v2[]
	): Promise<[void, void]> {
		const initial = original.map((label) => label.id);
		const updated = update.map((label) => label.id);

		const newLabelIds = without(updated, ...initial);
		const deletedLabelIds = without(initial, ...updated);

		return await Promise.all([
			AssignmentLabelsService.linkLabelsFromAssignment(id, newLabelIds),
			AssignmentLabelsService.unlinkLabelsFromAssignment(id, deletedLabelIds),
		]);
	}

	static async updateAssignmentBlocks(
		id: string,
		original: AssignmentBlock[],
		update: AssignmentBlock[]
	): Promise<any> {
		const deleted = original.filter((block) =>
			without(
				original.map((block) => block.id),
				...update.map((block) => block.id)
			).includes(block.id)
		);

		const created = update.filter(isNewAssignmentBlock);
		const existing = update.filter(
			(block) =>
				!deleted.map((d) => d.id).includes(block.id) &&
				!created.map((d) => d.id).includes(block.id)
		);

		const cleanup = (block: AssignmentBlock) => {
			delete block.item_meta;
			delete (block as any).icon;

			block.updated_at = new Date().toISOString();

			return block;
		};

		const promises = [
			...existing
				.map(cleanup)
				.filter((block) => block.id)
				.map((block) =>
					dataService.mutate({
						mutation: UPDATE_ASSIGNMENT_BLOCK,
						variables: { blockId: block.id, update: block },
						update: ApolloCacheManager.clearAssignmentCache,
					})
				),
			...deleted.map(cleanup).map((block) =>
				dataService.mutate({
					mutation: UPDATE_ASSIGNMENT_BLOCK,
					variables: { blockId: block.id, update: { ...block, is_deleted: true } },
					update: ApolloCacheManager.clearAssignmentCache,
				})
			),
		];

		if (created.length > 0) {
			promises.push(
				dataService.mutate({
					mutation: INSERT_ASSIGNMENT_BLOCKS,
					variables: {
						assignmentBlocks: created
							.map(cleanup)
							.map((block) => ({
								...block,
								assignment_id: id,
							}))
							.map((block) => {
								delete (block as any).id;

								return block;
							}),
					},
					update: ApolloCacheManager.clearAssignmentCache,
				})
			);
		}

		return await Promise.all(promises);
	}

	static async toggleAssignmentResponseSubmitStatus(
		id: number | string,
		submittedAt: string | null
	): Promise<void> {
		try {
			const response = await dataService.mutate<Avo.Assignment.Assignment_v2>({
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

			await this.updateAssignmentBlocks(assignmentId, [], assignment.blocks || []);

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

	private static warnAboutDeadlineInThePast(
		assignment: Pick<AssignmentSchema_v2, 'deadline_at'>
	) {
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
	): Promise<{
		assignmentBlocks: Avo.Assignment.Block[];
		assignment: Avo.Assignment.Assignment_v2;
	}> {
		try {
			// Load assignment
			const response: ApolloQueryResult<Avo.Assignment.Assignment_v2> =
				await dataService.query({
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
						block.item_meta =
							(await ItemsService.fetchItemByExternalId(block.fragment_id)) ||
							undefined;
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
	): boolean {
		return getProfileId(user) === assignment.owner_profile_id;
	}

	// Fetch assignment responses for response overview page
	static async fetchAssignmentResponses(
		assignmentId: string,
		user: Avo.User.User,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		page: number,
		filterString: string | undefined
	): Promise<{
		assignmentResponses: Avo.Assignment.Response_v2[];
		count: number;
	}> {
		let variables: any;
		try {
			const trimmedFilterString = filterString && filterString.trim();
			const filterArray: any[] = [];

			if (trimmedFilterString) {
				filterArray.push({
					_or: [
						{ owner: { full_name: { _ilike: `%${trimmedFilterString}%` } } },
						{ collection_title: { _ilike: `%${trimmedFilterString}%` } },
					],
				});
			}

			variables = {
				assignmentId,
				order: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					RESPONSE_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
				offset: page * ITEMS_PER_PAGE,
				limit: ITEMS_PER_PAGE,
				filter: filterArray.length ? filterArray : {},
			};
			const assignmentQuery = {
				variables,
				query: GET_ASSIGNMENT_RESPONSES_BY_ASSIGNMENT_ID,
			};

			// Get the assignment from graphql
			const response: ApolloQueryResult<any> = await dataService.query(assignmentQuery);
			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignmentResponse = get(response, 'data');

			if (
				!assignmentResponse ||
				!assignmentResponse.app_assignment_responses_v2 ||
				!assignmentResponse.count
			) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			return {
				assignmentResponses: get(assignmentResponse, 'app_assignment_responses_v2', []),
				count: get(assignmentResponse, 'count.aggregate.count', 0),
			};
		} catch (err) {
			throw new CustomError('Failed to fetch assignments from database', err, {
				user,
				variables,
				query: 'GET_ASSIGNMENT_RESPONSES_BY_ASSIGNMENT_ID',
			});
		}
	}

	static async deleteAssignmentResponse(assignmentResponseId: string): Promise<void> {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENT_RESPONSE,
				variables: { assignmentResponseId },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment response', err, {
				assignmentResponseId,
			});
			console.error(error);
			throw error;
		}
	}

	/**
	 * Fetches the item for each block in the pupil collection of the response
	 * If the item was replaced by another, the other item is used
	 * The item_meta is filled in into the existing response (mutable)
	 * @param assignmentResponse
	 */
	static async fillItemMetaForAssignmentResponse(
		assignmentResponse: Avo.Assignment.Response_v2
	): Promise<void> {
		// Fetch item_meta for each pupil collection block
		const items = await Promise.all(
			(assignmentResponse.pupil_collection_blocks || [])?.map((block) =>
				ItemsService.fetchItemByExternalId((block as PupilCollectionFragment).fragment_id)
			)
		);

		assignmentResponse.pupil_collection_blocks?.forEach((block) => {
			block.item_meta =
				items.find(
					(item) =>
						!!item &&
						item.external_id === (block as PupilCollectionFragment).fragment_id
				) || undefined;
		});
	}

	// Helper for create assignmentResponseObject method below
	static async getAssignmentResponse(
		profileId: string,
		assignmentId: string
	): Promise<Avo.Assignment.Response_v2 | undefined> {
		try {
			const response: ApolloQueryResult<{
				app_assignment_responses_v2: Avo.Assignment.Response_v2[];
			}> = await dataService.query({
				query: GET_ASSIGNMENT_RESPONSES,
				variables: { profileId, assignmentId },
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignmentResponse: Avo.Assignment.Response_v2 | undefined =
				response?.data?.app_assignment_responses_v2?.[0];

			if (!assignmentResponse) {
				return undefined;
			}

			await AssignmentService.fillItemMetaForAssignmentResponse(assignmentResponse);

			return assignmentResponse;
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
	static async createOrFetchAssignmentResponseObject(
		assignment: Avo.Assignment.Assignment_v2,
		user: Avo.User.User | undefined
	): Promise<Avo.Assignment.Response_v2 | null> {
		try {
			if (!user) {
				return null;
			}
			if (AssignmentService.isOwnerOfAssignment(assignment, user)) {
				return null;
			}
			const existingAssignmentResponse: Avo.Assignment.Response_v2 | undefined =
				await AssignmentService.getAssignmentResponse(
					get(user, 'profile.id'),
					get(assignment, 'id') as unknown as string
				);

			if (existingAssignmentResponse) {
				return existingAssignmentResponse;
			}

			// Student has never viewed this assignment before, we should create a response object for him
			const assignmentResponse: Partial<Avo.Assignment.Response_v2> = {
				owner_profile_id: getProfileId(user),
				assignment_id: assignment.id,
				collection_title:
					assignment.assignment_type === AssignmentType.BOUW ? 'Nieuwe collectie' : null,
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

			const insertedAssignmentResponse: Avo.Assignment.Response_v2 | undefined = get(
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

			await AssignmentService.fillItemMetaForAssignmentResponse(insertedAssignmentResponse);

			return insertedAssignmentResponse;
		} catch (err) {
			throw new CustomError('Failed to insert an assignment response in the database', err, {
				assignment,
			});
		}
	}

	static async getAssignmentBlockMaxPosition(assignmentId: string): Promise<number | null> {
		const result = await dataService.query({
			query: GET_MAX_POSITION_ASSIGNMENT_BLOCKS,
			variables: { assignmentId },
		});
		return get(
			result,
			'data.app_assignments_v2_by_pk.blocks_aggregate.aggregate.max.position',
			null
		);
	}

	static async importCollectionToAssignment(
		collection: Avo.Collection.Collection,
		assignmentId: string,
		withDescription: boolean
	): Promise<boolean> {
		if (collection.collection_fragments.length > 0) {
			const currentMaxPosition = await AssignmentService.getAssignmentBlockMaxPosition(
				assignmentId
			);
			const startPosition = currentMaxPosition === null ? 0 : currentMaxPosition + 1;
			const blocks = collection.collection_fragments.map((fragment: any, index: number) => {
				return {
					assignment_id: assignmentId,
					fragment_id: fragment.external_id,
					custom_title: null,
					custom_description: null,
					original_title: withDescription ? fragment.custom_title : null,
					original_description: withDescription ? fragment.custom_description : null,
					use_custom_fields: false,
					start_oc: fragment.start_oc,
					end_oc: fragment.end_oc,
					position: startPosition + index,
					thumbnail_path: fragment.thumbnail_path,
				};
			});
			try {
				await dataService.mutate({
					mutation: INSERT_ASSIGNMENT_BLOCKS,
					variables: {
						assignmentBlocks: blocks,
					},
					update: ApolloCacheManager.clearAssignmentCache,
				});
			} catch (err) {
				const error = new CustomError('Failed to import collection to assignment', err, {
					assignmentId,
					collectionId: collection.id,
				});
				console.error(error);
				throw error;
			}
		}
		return true;
	}

	static async createAssignmentFromCollection(
		user: Avo.User.User,
		collection: Avo.Collection.Collection,
		withDescription: boolean
	): Promise<string> {
		const assignmentToSave = {
			title: collection.title,
			description: collection.description,
			owner_profile_id: getProfileId(user),
			assignment_type: AssignmentType.KIJK,
		};

		const assignment = await dataService.mutate<Avo.Assignment.Assignment_v2>({
			mutation: INSERT_ASSIGNMENT,
			variables: {
				assignment: assignmentToSave,
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		const assignmentId = get(assignment, 'data.insert_app_assignments_v2.returning[0].id');

		if (isNil(assignmentId)) {
			throw new CustomError(
				'Saving the assignment failed, assignment id was undefined',
				null,
				{
					assignment,
				}
			);
		}

		await AssignmentService.importCollectionToAssignment(
			collection,
			assignmentId,
			withDescription
		);

		return assignmentId;
	}

	static async createAssignmentFromFragment(
		user: Avo.User.User,
		item: Avo.Item.Item
	): Promise<string> {
		const assignmentToSave = {
			title: item.title,
			owner_profile_id: getProfileId(user),
			assignment_type: AssignmentType.KIJK,
		};

		const assignment = await dataService.mutate<Avo.Assignment.Assignment_v2>({
			mutation: INSERT_ASSIGNMENT,
			variables: {
				assignment: assignmentToSave,
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		const assignmentId = get(assignment, 'data.insert_app_assignments_v2.returning[0].id');

		if (isNil(assignmentId)) {
			throw new CustomError(
				'Saving the assignment failed, assignment id was undefined',
				null,
				{
					assignment,
				}
			);
		}

		// Add block with this fragment
		const block = {
			assignment_id: assignmentId,
			fragment_id: item.external_id,
			type: 'ITEM',
			position: 0,
		};

		await dataService.mutate({
			mutation: INSERT_ASSIGNMENT_BLOCKS,
			variables: {
				assignmentBlocks: [block],
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		return assignmentId;
	}

	static async importFragmentToAssignment(
		item: Avo.Item.Item,
		assignmentId: string,
		itemTrimInfo?: ItemTrimInfo
	): Promise<string> {
		// Handle trim settings and thumbnail
		const trimInfo: ItemTrimInfo = itemTrimInfo || {
			hasCut: false,
			fragmentStartTime: 0,
			fragmentEndTime: 0,
		};
		const thumbnailPath = trimInfo.fragmentStartTime
			? await VideoStillService.getVideoStill(
					item.external_id,
					trimInfo.fragmentStartTime * 1000
			  )
			: null;

		// Determine block position
		const currentMaxPosition = await AssignmentService.getAssignmentBlockMaxPosition(
			assignmentId
		);
		const startPosition = currentMaxPosition === null ? 0 : currentMaxPosition + 1;

		// Add block with this fragment
		const block = {
			assignment_id: assignmentId,
			fragment_id: item.external_id,
			type: AssignmentBlockType.ITEM,
			start_oc: trimInfo.hasCut ? trimInfo.fragmentStartTime : null,
			end_oc: trimInfo.hasCut ? trimInfo.fragmentEndTime : null,
			position: startPosition,
			thumbnail_path: thumbnailPath,
		};

		await dataService.mutate({
			mutation: INSERT_ASSIGNMENT_BLOCKS,
			variables: {
				assignmentBlocks: [block],
			},
			update: ApolloCacheManager.clearAssignmentCache,
		});

		return assignmentId;
	}

	static async fetchAssignmentsForAdmin(
		page: number,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.Assignment.Assignment_v2[], number]> {
		let variables;
		try {
			const whereWithoutDeleted = {
				...where,
				is_deleted: { _eq: false },
			};

			variables = {
				offset: itemsPerPage * page,
				limit: itemsPerPage,
				where: whereWithoutDeleted,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query({
				variables,
				query: GET_ASSIGNMENTS_ADMIN_OVERVIEW,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const assignments: Avo.Assignment.Assignment_v2[] = response?.data?.app_assignments_v2;

			const assignmentCount =
				response?.data?.app_assignments_v2_aggregate?.aggregate?.count || 0;

			if (!assignments) {
				throw new CustomError('Response does not contain any assignments', null, {
					response,
				});
			}

			return [assignments as Avo.Assignment.Assignment_v2[], assignmentCount];
		} catch (err) {
			throw new CustomError('Failed to get assignments from the database', err, {
				variables,
				query: 'GET_ASSIGNMENTS_ADMIN_OVERVIEW',
			});
		}
	}

	static async getAssignmentIds(where: any = {}): Promise<string[]> {
		let variables;
		try {
			const whereWithoutDeleted = {
				...where,
				is_deleted: { _eq: false },
			};

			variables = {
				where: whereWithoutDeleted,
			};

			const response = await dataService.query({
				variables,
				query: GET_ASSIGNMENT_IDS,
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}

			const assignmentIds: string[] = (response?.data?.app_assignments_v2 || []).map(
				(assignment: Avo.Assignment.Assignment_v2) => assignment.id
			);

			if (!assignmentIds) {
				throw new CustomError('Response does not contain any assignment ids', null, {
					response,
				});
			}

			return assignmentIds;
		} catch (err) {
			throw new CustomError('Failed to get assignment ids from the database', err, {
				variables,
				query: 'GET_ASSIGNMENT_IDS',
			});
		}
	}

	static async changeAssignmentsAuthor(
		profileId: string,
		assignmentIds: string[]
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: BULK_UPDATE_AUTHOR_FOR_ASSIGNMENTS,
				variables: {
					assignmentIds,
					authorId: profileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return response?.data?.update_app_assignments_v2?.affected_rows || 0;
		} catch (err) {
			throw new CustomError('Failed to update author for assignments in the database', err, {
				profileId,
				assignmentIds,
				query: 'BULK_UPDATE_AUTHOR_FOR_ASSIGNMENTS',
			});
		}
	}
}
