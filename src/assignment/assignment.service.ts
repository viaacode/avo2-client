import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { cloneDeep, compact, isEmpty, isNil, map, uniq, without } from 'lodash-es';
import { stringifyUrl } from 'query-string';

import { ItemsService } from '../admin/items/items.service';
import { SpecialUserGroup } from '../admin/user-groups/user-group.const';
import { getUserGroupIds } from '../authentication/authentication.service';
import { getProfileId } from '../authentication/helpers/get-profile-id';
import { ItemTrimInfo } from '../item/item.types';
import { PupilCollectionService } from '../pupil-collection/pupil-collection.service';
import {
	ContributorInfo,
	ShareRightsType,
} from '../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import {
	App_Assignments_V2_Insert_Input,
	App_Assignments_V2_Set_Input,
	AssignmentPupilBlocksDocument,
	AssignmentPupilBlocksQuery,
	AssignmentPupilBlocksQueryVariables,
	BulkUpdateAuthorForAssignmentsDocument,
	BulkUpdateAuthorForAssignmentsMutation,
	BulkUpdateAuthorForAssignmentsMutationVariables,
	DeleteAssignmentByIdDocument,
	DeleteAssignmentByIdMutation,
	DeleteAssignmentByIdMutationVariables,
	DeleteAssignmentLomLinksDocument,
	DeleteAssignmentLomLinksMutation,
	DeleteAssignmentLomLinksMutationVariables,
	DeleteAssignmentResponseByIdDocument,
	DeleteAssignmentResponseByIdMutation,
	DeleteAssignmentResponseByIdMutationVariables,
	DeleteAssignmentsByIdDocument,
	DeleteAssignmentsByIdMutation,
	DeleteAssignmentsByIdMutationVariables,
	GetAssignmentBlocksDocument,
	GetAssignmentBlocksQuery,
	GetAssignmentBlocksQueryVariables,
	GetAssignmentByTitleOrDescriptionDocument,
	GetAssignmentByTitleOrDescriptionQuery,
	GetAssignmentByTitleOrDescriptionQueryVariables,
	GetAssignmentIdsDocument,
	GetAssignmentIdsQuery,
	GetAssignmentIdsQueryVariables,
	GetAssignmentResponseByIdDocument,
	GetAssignmentResponseByIdQuery,
	GetAssignmentResponseByIdQueryVariables,
	GetAssignmentResponseDocument,
	GetAssignmentResponseQuery,
	GetAssignmentResponseQueryVariables,
	GetAssignmentResponsesByAssignmentIdDocument,
	GetAssignmentResponsesByAssignmentIdQuery,
	GetAssignmentResponsesByAssignmentIdQueryVariables,
	GetAssignmentResponsesDocument,
	GetAssignmentResponsesQuery,
	GetAssignmentResponsesQueryVariables,
	GetAssignmentsAdminOverviewDocument,
	GetAssignmentsAdminOverviewQuery,
	GetAssignmentsAdminOverviewQueryVariables,
	GetAssignmentsByOwnerDocument,
	GetAssignmentsByOwnerQuery,
	GetAssignmentsByOwnerQueryVariables,
	GetAssignmentsByResponseOwnerIdDocument,
	GetAssignmentsByResponseOwnerIdQuery,
	GetAssignmentsByResponseOwnerIdQueryVariables,
	GetAssignmentWithResponseDocument,
	GetAssignmentWithResponseQuery,
	GetAssignmentWithResponseQueryVariables,
	GetContributorsByAssignmentUuidDocument,
	GetContributorsByAssignmentUuidQuery,
	GetContributorsByAssignmentUuidQueryVariables,
	GetMaxPositionAssignmentBlocksDocument,
	GetMaxPositionAssignmentBlocksQuery,
	GetMaxPositionAssignmentBlocksQueryVariables,
	IncrementAssignmentViewCountDocument,
	IncrementAssignmentViewCountMutation,
	IncrementAssignmentViewCountMutationVariables,
	InsertAssignmentBlocksDocument,
	InsertAssignmentBlocksMutation,
	InsertAssignmentBlocksMutationVariables,
	InsertAssignmentDocument,
	InsertAssignmentLomLinksDocument,
	InsertAssignmentLomLinksMutation,
	InsertAssignmentLomLinksMutationVariables,
	InsertAssignmentMutation,
	InsertAssignmentMutationVariables,
	InsertAssignmentResponseDocument,
	InsertAssignmentResponseMutation,
	InsertAssignmentResponseMutationVariables,
	UpdateAssignmentBlockDocument,
	UpdateAssignmentBlockMutation,
	UpdateAssignmentBlockMutationVariables,
	UpdateAssignmentByIdDocument,
	UpdateAssignmentByIdMutation,
	UpdateAssignmentByIdMutationVariables,
	UpdateAssignmentResponseDocument,
	UpdateAssignmentResponseMutation,
	UpdateAssignmentResponseMutationVariables,
	UpdateAssignmentUpdatedAtDateDocument,
	UpdateAssignmentUpdatedAtDateMutation,
	UpdateAssignmentUpdatedAtDateMutationVariables,
} from '../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import { tText } from '../shared/helpers/translate';
import { AssignmentLabelsService } from '../shared/services/assignment-labels-service';
import { dataService } from '../shared/services/data-service';
import { trackEvents } from '../shared/services/event-logging-service';
import { VideoStillService } from '../shared/services/video-stills-service';
import { Contributor } from '../shared/types/contributor';
import { TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
	isNewAssignmentBlock,
	ITEMS_PER_PAGE,
	RESPONSE_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './assignment.const';
import {
	Assignment_Label_v2,
	Assignment_Response_v2,
	Assignment_v2_With_Blocks,
	Assignment_v2_With_Labels,
	Assignment_v2_With_Responses,
	AssignmentBlock,
	AssignmentBlockType,
	AssignmentOverviewTableColumns,
	AssignmentResponseInfo,
	AssignmentType,
	BaseBlockWithMeta,
	PupilCollectionFragment,
} from './assignment.types';
import { endOfAcademicYear, startOfAcademicYear } from './helpers/academic-year';
import { isItemWithMeta } from './helpers/is-item-with-meta';

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
		assignments: Assignment_v2_With_Labels[];
		count: number;
	}> {
		let variables:
			| GetAssignmentsByOwnerQueryVariables
			| GetAssignmentsByResponseOwnerIdQueryVariables
			| null = null;
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
						...(!canEditAssignments // Only search by teacher if user is not a teacher
							? [{ owner: { full_name: { _ilike: `%${trimmedFilterString}%` } } }]
							: []),
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
					filterArray.push({ deadline_at: { _lt: new Date().toISOString() } });
				} else {
					filterArray.push({
						_or: [
							{ deadline_at: { _gt: new Date().toISOString() } },
							{ deadline_at: { _is_null: true } },
						],
					});
				}
			}

			if (getUserGroupIds(user).includes(SpecialUserGroup.Pupil)) {
				// Filter on academic year for students
				filterArray.push({
					_and: [
						{ deadline_at: { _gte: startOfAcademicYear().toISOString() } },
						{ deadline_at: { _lte: endOfAcademicYear().toISOString() } },
					],
				});
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

			// Get the assignment from graphql
			const assignmentResponse = await dataService.query<
				GetAssignmentsByOwnerQuery | GetAssignmentsByResponseOwnerIdQuery,
				GetAssignmentsByOwnerQueryVariables | GetAssignmentsByResponseOwnerIdQueryVariables
			>({
				variables,
				query: canEditAssignments
					? GetAssignmentsByOwnerDocument
					: GetAssignmentsByResponseOwnerIdDocument,
			});

			if (
				!assignmentResponse?.app_assignments_v2_overview ||
				isNil(assignmentResponse.count)
			) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			return {
				assignments: assignmentResponse.app_assignments_v2_overview || [],
				count: assignmentResponse.count.aggregate?.count || 0,
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

	static async fetchAssignmentById(
		assignmentId: string
	): Promise<Assignment_v2_With_Blocks & Assignment_v2_With_Labels> {
		try {
			const assignment: Assignment_v2_With_Blocks & Assignment_v2_With_Labels =
				await fetchWithLogoutJson(
					stringifyUrl({
						url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}`,
					}),
					{ method: 'GET' }
				);

			if (!assignment) {
				throw new CustomError('Response does not contain an assignment', null, {
					response: assignment,
				});
			}

			return {
				...assignment,
				blocks: await this.enrichBlocksWithMeta<AssignmentBlock>(assignment.blocks),
			};
		} catch (err) {
			throw new CustomError('Failed to get assignment by id from database', err, {
				assignmentId,
				query: 'GET_ASSIGNMENT_BY_UUID',
			});
		}
	}

	static async hasPupilCollectionBlocks(assignmentId: string): Promise<boolean> {
		const pupilBlocks = await dataService.query<
			AssignmentPupilBlocksQuery,
			AssignmentPupilBlocksQueryVariables
		>({
			query: AssignmentPupilBlocksDocument,
			variables: { assignmentId },
		});
		return pupilBlocks.app_pupil_collection_blocks.length > 0;
	}

	static async fetchAssignmentBlocks(assignmentId: string): Promise<AssignmentBlock[]> {
		const blocks = await dataService.query<
			GetAssignmentBlocksQuery,
			GetAssignmentBlocksQueryVariables
		>({
			query: GetAssignmentBlocksDocument,
			variables: { assignmentId },
		});
		return blocks.app_assignment_blocks_v2 || [];
	}

	/**
	 * Helper functions for inserting, updating, validating and deleting assignment
	 * This will be used by the Assignments view and the AssignmentEdit view
	 * @param assignment
	 */
	private static transformAssignment(
		assignment: Partial<Assignment_v2_With_Blocks>
	): App_Assignments_V2_Insert_Input | App_Assignments_V2_Set_Input {
		const assignmentToSave = cloneDeep(assignment);

		if (
			assignment.blocks?.some(
				(block: AssignmentBlock) => block.type === AssignmentBlockType.ZOEK
			)
		) {
			assignmentToSave.lom_learning_resource_type?.includes(AssignmentType.ZOEK);
		} else if (
			assignment.blocks?.some(
				(block: AssignmentBlock) => block.type === AssignmentBlockType.BOUW
			)
		) {
			assignmentToSave.lom_learning_resource_type?.includes(AssignmentType.BOUW);
		} else {
			assignmentToSave.lom_learning_resource_type?.includes(AssignmentType.KIJK);
		}

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

		delete (assignmentToSave as any).owner;
		delete (assignmentToSave as any).profile;
		delete (assignmentToSave as any).responses;
		delete (assignmentToSave as any).labels;
		delete (assignmentToSave as any).__typename;
		delete (assignmentToSave as any).descriptionRichEditorState;
		delete assignmentToSave.blocks;
		delete assignmentToSave.loms;
		delete assignmentToSave.contributors;

		return assignmentToSave as Avo.Assignment.Assignment;
	}

	static async deleteAssignment(assignmentId: string): Promise<void> {
		try {
			await dataService.query<
				DeleteAssignmentByIdMutation,
				DeleteAssignmentByIdMutationVariables
			>({
				query: DeleteAssignmentByIdDocument,
				variables: { assignmentId },
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment', err, { assignmentId });
			console.error(error);
			throw error;
		}
	}

	static async deleteAssignments(assignmentIds: string[]): Promise<void> {
		try {
			await dataService.query<
				DeleteAssignmentsByIdMutation,
				DeleteAssignmentsByIdMutationVariables
			>({
				query: DeleteAssignmentsByIdDocument,
				variables: { assignmentIds },
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment', err, { assignmentIds });
			console.error(error);
			throw error;
		}
	}

	static async updateAssignment(
		original: Assignment_v2_With_Blocks,
		update: Partial<Assignment_v2_With_Blocks>
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			if (isNil(original.id)) {
				throw new CustomError(
					'Failed to update assignment because its id is undefined',
					null,
					{ original, update }
				);
			}

			update.updated_at = new Date().toISOString();

			await AssignmentService.updateAssignmentBlocks(
				original.id,
				original.blocks || [],
				update.blocks || []
			);

			await AssignmentService.deleteAssignmentLomLinks(original.id);

			const loms = map(update.loms, 'lom_id');

			await AssignmentService.insertAssignmentLomLinks(original.id, loms);

			const assignment = AssignmentService.transformAssignment({
				...update,
			});

			const variables: UpdateAssignmentByIdMutationVariables = {
				assignment,
				assignmentId: original.id,
			};
			await dataService.query<
				UpdateAssignmentByIdMutation,
				UpdateAssignmentByIdMutationVariables
			>({
				query: UpdateAssignmentByIdDocument,
				variables,
			});

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

	static async updateAssignmentUpdatedAtDate(assignmentId: string): Promise<void> {
		try {
			const variables: UpdateAssignmentUpdatedAtDateMutationVariables = {
				assignmentId,
				updatedAt: new Date().toISOString(),
			};
			await dataService.query<
				UpdateAssignmentUpdatedAtDateMutation,
				UpdateAssignmentUpdatedAtDateMutationVariables
			>({
				query: UpdateAssignmentUpdatedAtDateDocument,
				variables,
			});
		} catch (err) {
			const error = new CustomError('Failed to update assignment updated_at date', err, {
				assignmentId,
				query: 'UPDATE_ASSIGNMENT_UPDATED_AT_DATE',
			});

			console.error(error);
			throw error;
		}
	}

	static async updateAssignmentResponse(
		original: Omit<AssignmentResponseInfo, 'assignment'>,
		update: {
			collection_title: string;
			pupil_collection_blocks: PupilCollectionFragment[];
		}
	): Promise<Omit<Assignment_Response_v2, 'assignment'> | null> {
		try {
			if (isNil(original.id)) {
				throw new CustomError(
					'Failed to update assignment response because its id is undefined',
					null,
					{ original, update }
				);
			}

			const variables: UpdateAssignmentResponseMutationVariables = {
				collectionTitle: update.collection_title,
				updatedAt: new Date().toISOString(),
				assignmentResponseId: original.id,
			};
			await dataService.query<
				UpdateAssignmentResponseMutation,
				UpdateAssignmentResponseMutationVariables
			>({
				query: UpdateAssignmentResponseDocument,
				variables,
			});

			// Update blocks
			await PupilCollectionService.updatePupilCollectionBlocks(
				original.id,
				(original.pupil_collection_blocks || []) as PupilCollectionFragment[],
				(update.pupil_collection_blocks || []) as PupilCollectionFragment[]
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

	static async updateAssignmentLabels(
		id: string,
		original: Assignment_Label_v2[],
		update: Assignment_Label_v2[]
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

		const cleanup = (block: BaseBlockWithMeta) => {
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
					dataService.query<
						UpdateAssignmentBlockMutation,
						UpdateAssignmentBlockMutationVariables
					>({
						query: UpdateAssignmentBlockDocument,
						variables: { blockId: block.id, update: block },
					})
				),
			...deleted.map(cleanup).map((block) =>
				dataService.query<
					UpdateAssignmentBlockMutation,
					UpdateAssignmentBlockMutationVariables
				>({
					query: UpdateAssignmentBlockDocument,
					variables: { blockId: block.id, update: { ...block, is_deleted: true } },
				})
			),
		];

		if (created.length > 0) {
			promises.push(
				dataService.query<
					InsertAssignmentBlocksMutation,
					InsertAssignmentBlocksMutationVariables
				>({
					query: InsertAssignmentBlocksDocument,
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
				})
			);
		}

		return await Promise.all(promises);
	}

	static updateAssignmentProperties = async (
		assignmentId: string,
		assignment: Partial<Avo.Assignment.Assignment>
	): Promise<void> => {
		try {
			const variables: UpdateAssignmentByIdMutationVariables = { assignmentId, assignment };

			await dataService.query<
				UpdateAssignmentByIdMutation,
				UpdateAssignmentByIdMutationVariables
			>({
				query: UpdateAssignmentByIdDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to update assignment properties', err, {
				id: assignmentId,
				assigment: assignment,
				query: 'UPDATE_ASSIGNMENT ',
			});
		}
	};

	static async insertAssignment(
		assignment: Partial<Assignment_v2_With_Blocks>,
		addedLabels?: Assignment_Label_v2[]
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			const assignmentToSave = AssignmentService.transformAssignment({
				...assignment,
			});

			const variables: InsertAssignmentMutationVariables = {
				assignment: assignmentToSave,
			};
			const response = await dataService.query<
				InsertAssignmentMutation,
				InsertAssignmentMutationVariables
			>({
				query: InsertAssignmentDocument,
				variables,
			});

			const assignmentId = response.insert_app_assignments_v2?.returning?.[0]?.id;

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
				const addedLabelIds = addedLabels.map((item) => item.id);

				await Promise.all([
					AssignmentLabelsService.linkLabelsFromAssignment(assignmentId, addedLabelIds),
				]);
			}

			await this.updateAssignmentBlocks(assignmentId, [], assignment.blocks || []);

			return {
				...(assignment as Avo.Assignment.Assignment), // Do not copy the auto modified fields from the validation back into the input controls
				id: assignmentId,
			};
		} catch (err) {
			throw new CustomError('Failed to insert assignment', err, { assignment, addedLabels });
		}
	}

	static async duplicateAssignment(
		newTitle: string,
		initialAssignment: Partial<Assignment_v2_With_Blocks> | null
	): Promise<Avo.Assignment.Assignment> {
		if (!initialAssignment || !initialAssignment.id) {
			throw new CustomError(
				'Failed to copy assignment because the duplicateAssignment function received an empty assignment',
				null,
				{ newTitle, initialAssignment }
			);
		}

		// clone the assignment
		const newAssignment: Partial<Assignment_v2_With_Blocks> = {
			...cloneDeep(initialAssignment),
			title: newTitle,
			available_at: new Date().toISOString(),
			deadline_at: null,
			answer_url: null,
		};

		delete newAssignment.id;
		delete newAssignment.owner;
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

		const blocks: AssignmentBlock[] = await AssignmentService.fetchAssignmentBlocks(
			initialAssignment.id
		);
		await AssignmentService.copyBlocksToAssignment(blocks, duplicatedAssignment.id);

		return duplicatedAssignment;
	}

	static async copyBlocksToAssignment(
		blocks: AssignmentBlock[],
		assignmentId: string
	): Promise<void> {
		if (!blocks || !blocks.length) {
			return;
		}
		try {
			const newBlocks = blocks.map((block) => {
				// clone the block
				const newBlock: Partial<AssignmentBlock> = {
					...cloneDeep(block),
					assignment_id: assignmentId,
				};

				delete newBlock.id;
				newBlock.updated_at = new Date().toISOString();

				return newBlock;
			});

			await dataService.query<
				InsertAssignmentBlocksMutation,
				InsertAssignmentBlocksMutationVariables
			>({
				query: InsertAssignmentBlocksDocument,
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

	static async fetchAssignmentAndContent(
		pupilProfileId: string,
		assignmentId: string
	): Promise<Assignment_v2_With_Labels & Assignment_v2_With_Responses> {
		try {
			// Load assignment
			const variables: GetAssignmentWithResponseQueryVariables = {
				assignmentId,
				pupilUuid: pupilProfileId,
			};
			const response = await dataService.query<
				GetAssignmentWithResponseQuery,
				GetAssignmentWithResponseQueryVariables
			>({
				query: GetAssignmentWithResponseDocument,
				variables,
			});

			const tempAssignment = response.app_assignments_v2_overview[0];

			if (!tempAssignment) {
				throw new CustomError('Failed to find assignment by id');
			}

			// Load content (collection, item or search query) according to assignment
			const initialAssignmentBlocks = await AssignmentService.fetchAssignmentBlocks(
				assignmentId
			);

			const blocks = await this.enrichBlocksWithMeta<AssignmentBlock>(
				initialAssignmentBlocks
			);

			return {
				...tempAssignment,
				blocks,
			};
		} catch (err: any) {
			const graphqlError = err?.graphQLErrors?.[0]?.message;

			if (graphqlError) {
				return graphqlError;
			}

			const customError = new CustomError('Failed to fetch assignment with content', err, {
				pupilProfileId,
				assignmentId,
			});

			console.error(customError);

			throw customError;
		}
	}

	static isOwnerOfAssignment(
		assignment: Avo.Assignment.Assignment,
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
		assignmentResponses: Assignment_Response_v2[];
		count: number;
	}> {
		let variables: GetAssignmentResponsesByAssignmentIdQueryVariables | undefined = undefined;
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

			// Get the assignment from graphql
			const assignmentResponse = await dataService.query<
				GetAssignmentResponsesByAssignmentIdQuery,
				GetAssignmentResponsesByAssignmentIdQueryVariables
			>({
				query: GetAssignmentResponsesByAssignmentIdDocument,
				variables,
			});

			if (
				!assignmentResponse ||
				!assignmentResponse.app_assignment_responses_v2 ||
				!assignmentResponse.count
			) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			const assignmentResponses = assignmentResponse.app_assignment_responses_v2 || [];

			// Enrich assignmentResponses with item infos
			const fragmentExternalIds = compact(
				assignmentResponses.flatMap((response) =>
					response.pupil_collection_blocks?.map((block) => block.fragment_id)
				)
			);
			const itemMetas = await ItemsService.fetchItemsByExternalIds(fragmentExternalIds);
			assignmentResponses.forEach((response) => {
				response.pupil_collection_blocks?.forEach((block) => {
					(block as any).item_meta = itemMetas.find(
						(itemMeta) =>
							!!itemMeta?.external_id && itemMeta?.external_id === block.fragment_id
					);
				});
			});

			return {
				assignmentResponses,
				count: assignmentResponse.count.aggregate?.count || 0,
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
			const variables: DeleteAssignmentResponseByIdMutationVariables = {
				assignmentResponseId,
			};
			await dataService.query<
				DeleteAssignmentResponseByIdMutation,
				DeleteAssignmentResponseByIdMutationVariables
			>({
				query: DeleteAssignmentResponseByIdDocument,
				variables,
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
	 * Fetches the item for each block in the list of given blocks
	 * If the item was replaced by another, the other item is used
	 * The item_meta is filled in into the existing response (mutable)
	 * @param blocks
	 * @param items
	 */
	static async enrichBlocksWithMeta<T extends PupilCollectionFragment | AssignmentBlock>(
		blocks?: T[],
		items: (Avo.Item.Item | null)[] = []
	): Promise<T[]> {
		const enriched = await Promise.all(
			(blocks || []).map(async (block): Promise<BaseBlockWithMeta> => {
				if (block.fragment_id) {
					try {
						const item_meta =
							items.find((item) => item?.external_id === block.fragment_id) ||
							(await ItemsService.fetchItemByExternalId(block.fragment_id)) ||
							undefined;

						// * For collection items, we want to use the original_title and original_description.
						//     This is what the collection creator entered as a custom title and description for the item when it was added to the collection
						// * For items that were directly added to the assignment, we need to use the fragment title and description,
						//     so when those are updated, the fragment in the assignment also updates
						return {
							...block,
							original_title: (block as any).original_title || item_meta?.title,
							original_description:
								(block as any).original_description || item_meta?.description,
							item_meta,
						} as BaseBlockWithMeta;
					} catch (error) {
						console.warn(`Unable to fetch meta data for ${block.fragment_id}`, error);
					}
				}

				return block;
			})
		);

		return enriched.filter(isItemWithMeta) as unknown as T[];
	}

	/**
	 * Get the assignment responses for the specified assignment id and owner of the assignment
	 * @param profileId
	 * @param assignmentId
	 */
	static async getAssignmentResponses(
		profileId: string,
		assignmentId: string
	): Promise<GetAssignmentResponsesQuery['app_assignment_responses_v2']> {
		try {
			const variables: GetAssignmentResponsesQueryVariables = { profileId, assignmentId };
			const response = await dataService.query<
				GetAssignmentResponsesQuery,
				GetAssignmentResponsesQueryVariables
			>({
				query: GetAssignmentResponsesDocument,
				variables,
			});

			return response?.app_assignment_responses_v2 || [];
		} catch (err) {
			throw new CustomError('Failed to get assignment responses from database', err, {
				profileId,
				query: 'GET_ASSIGNMENT_RESPONSES',
			});
		}
	}

	/**
	 * Get One specific assignment response for the current user for the specified assignment
	 * Helper for create assignmentResponseObject method below
	 */
	static async getAssignmentResponse(
		profileId: string,
		assignmentId: string
	): Promise<Omit<AssignmentResponseInfo, 'assignment'> | undefined> {
		try {
			const variables: GetAssignmentResponseQueryVariables = { profileId, assignmentId };
			const response = await dataService.query<
				GetAssignmentResponseQuery,
				GetAssignmentResponseQueryVariables
			>({
				query: GetAssignmentResponseDocument,
				variables,
			});

			const assignmentResponse = response?.app_assignment_responses_v2?.[0];

			if (!assignmentResponse) {
				return undefined;
			}

			return {
				...assignmentResponse,
				pupil_collection_blocks:
					await AssignmentService.enrichBlocksWithMeta<PupilCollectionFragment>(
						assignmentResponse.pupil_collection_blocks
					),
			};
		} catch (err) {
			throw new CustomError('Failed to get assignment response from database', err, {
				profileId,
				query: 'GET_ASSIGNMENT_RESPONSE',
			});
		}
	}

	/**
	 * Get a response (and pupil collection) by assignmentResponseId
	 */
	static async getAssignmentResponseById(
		assignmentResponseId: string
	): Promise<AssignmentResponseInfo | null> {
		try {
			const variables: GetAssignmentResponseByIdQueryVariables = { assignmentResponseId };
			const response = await dataService.query<
				GetAssignmentResponseByIdQuery,
				GetAssignmentResponseByIdQueryVariables
			>({
				query: GetAssignmentResponseByIdDocument,
				variables,
			});

			const assignmentResponse:
				| GetAssignmentResponseByIdQuery['app_assignment_responses_v2'][0]
				| undefined = response?.app_assignment_responses_v2?.[0];

			if (!assignmentResponse) {
				return null;
			}

			return {
				...assignmentResponse,
				pupil_collection_blocks:
					await AssignmentService.enrichBlocksWithMeta<PupilCollectionFragment>(
						assignmentResponse.pupil_collection_blocks
					),
			};
		} catch (err) {
			throw new CustomError('Failed to get assignment response from database', err, {
				assignmentResponseId,
				query: 'GET_ASSIGNMENT_RESPONSE',
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
		assignment: Avo.Assignment.Assignment,
		user: Avo.User.User | undefined
	): Promise<Omit<AssignmentResponseInfo, 'assignment'> | null> {
		try {
			if (!user || !user.profile) {
				return null;
			}
			const existingAssignmentResponse:
				| Omit<AssignmentResponseInfo, 'assignment'>
				| undefined = await AssignmentService.getAssignmentResponse(
				user.profile.id,
				assignment?.id
			);

			if (existingAssignmentResponse) {
				if (assignment.lom_learning_resource_type?.includes(AssignmentType.BOUW)) {
					existingAssignmentResponse.collection_title =
						existingAssignmentResponse.collection_title ||
						tText('assignment/assignment___nieuwe-collectie');
				}
				return {
					...existingAssignmentResponse,
					pupil_collection_blocks:
						existingAssignmentResponse.pupil_collection_blocks || [],
				};
			}

			// Student has never viewed this assignment before, we should create a response object for him
			const assignmentResponse: Partial<Assignment_Response_v2> = {
				owner_profile_id: getProfileId(user),
				assignment_id: assignment.id,
				collection_title: assignment.lom_learning_resource_type?.includes(
					AssignmentType.BOUW
				)
					? tText('assignment/assignment___nieuwe-collectie')
					: null,
			};
			const response = await dataService.query<
				InsertAssignmentResponseMutation,
				InsertAssignmentResponseMutationVariables
			>({
				query: InsertAssignmentResponseDocument,
				variables: {
					assignmentResponses: [assignmentResponse as any],
				},
			});

			const insertedAssignmentResponse =
				response.insert_app_assignment_responses_v2?.returning?.[0];

			if (isNil(insertedAssignmentResponse)) {
				throw new CustomError(
					'Response from graphql does not contain an assignment response',
					null,
					{ response }
				);
			}

			return {
				...insertedAssignmentResponse,
				pupil_collection_blocks: await this.enrichBlocksWithMeta<PupilCollectionFragment>(
					insertedAssignmentResponse.pupil_collection_blocks
				),
			};
		} catch (err) {
			throw new CustomError('Failed to insert an assignment response in the database', err, {
				assignment,
			});
		}
	}

	static async getAssignmentBlockMaxPosition(assignmentId: string): Promise<number | null> {
		const result = await dataService.query<
			GetMaxPositionAssignmentBlocksQuery,
			GetMaxPositionAssignmentBlocksQueryVariables
		>({
			query: GetMaxPositionAssignmentBlocksDocument,
			variables: { assignmentId },
		});
		return result.app_assignments_v2_by_pk?.blocks_aggregate?.aggregate?.max?.position || null;
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
				const block: Partial<AssignmentBlock> = {
					assignment_id: assignmentId,
					fragment_id: fragment.external_id,
					custom_title: null,
					custom_description: null,
					original_title: null,
					original_description: null,
					use_custom_fields: false,
					start_oc: fragment.start_oc,
					end_oc: fragment.end_oc,
					position: startPosition + index,
					thumbnail_path: fragment.thumbnail_path,
				};
				if (fragment.type === AssignmentBlockType.TEXT) {
					// text: original text null, custom text set
					block.custom_title = fragment.custom_title;
					block.custom_description = fragment.custom_description;
					block.use_custom_fields = true;
					block.type = AssignmentBlockType.TEXT;
				} else {
					// ITEM
					// custom_title and custom_description remain null
					// regardless of withDescription: ALWAYS copy the fragment custom title and description to the original fields
					// Since importing from collection, the collection is the source of truth and the original == collection fields
					block.original_title = fragment.custom_title;
					block.original_description = fragment.custom_description;
					block.use_custom_fields = !withDescription;
					block.type = AssignmentBlockType.ITEM;
				}

				return block;
			});
			try {
				// Insert fragments into assignment and update the updated_at date in parallel
				await Promise.all([
					dataService.query<
						InsertAssignmentBlocksMutation,
						InsertAssignmentBlocksMutationVariables
					>({
						query: InsertAssignmentBlocksDocument,
						variables: {
							assignmentBlocks: blocks,
						},
					}),
					this.updateAssignmentUpdatedAtDate(assignmentId),
				]);
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
		const variables: InsertAssignmentMutationVariables = {
			assignment: {
				title: collection.title,
				description: collection.description,
				owner_profile_id: getProfileId(user),
				assignment_type: AssignmentType.KIJK,
			},
		};

		const assignment = await dataService.query<
			InsertAssignmentMutation,
			InsertAssignmentMutationVariables
		>({
			query: InsertAssignmentDocument,
			variables,
		});

		const assignmentId = assignment.insert_app_assignments_v2?.returning?.[0]?.id;

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

		// Success
		// Track import collection into assigment event
		trackEvents(
			{
				object: assignmentId,
				object_type: 'avo_assignment',
				action: 'add',
				resource: {
					type: 'collection',
					id: collection.id,
				},
			},
			user
		);

		return assignmentId;
	}

	static async createAssignmentFromFragment(
		user: Avo.User.User,
		item: Avo.Item.Item & { start_oc?: number | null; end_oc?: number | null }
	): Promise<string> {
		const variables: InsertAssignmentMutationVariables = {
			assignment: {
				title: item.title,
				owner_profile_id: getProfileId(user),
				assignment_type: AssignmentType.KIJK,
			},
		};

		const assignment = await dataService.query<
			InsertAssignmentMutation,
			InsertAssignmentMutationVariables
		>({
			query: InsertAssignmentDocument,
			variables,
		});

		const assignmentId = assignment.insert_app_assignments_v2?.returning?.[0]?.id;

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
			start_oc: item.start_oc,
			end_oc: item.end_oc,
		};

		await dataService.query<
			InsertAssignmentBlocksMutation,
			InsertAssignmentBlocksMutationVariables
		>({
			query: InsertAssignmentBlocksDocument,
			variables: {
				assignmentBlocks: [block],
			},
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

		// Insert fragment into assignment and update the updated_at date in parallel
		await Promise.all([
			dataService.query<
				InsertAssignmentBlocksMutation,
				InsertAssignmentBlocksMutationVariables
			>({
				query: InsertAssignmentBlocksDocument,
				variables: {
					assignmentBlocks: [block],
				},
			}),
			this.updateAssignmentUpdatedAtDate(assignmentId),
		]);

		return assignmentId;
	}

	static async fetchAssignmentsForAdmin(
		page: number,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any = {},
		itemsPerPage: number = ITEMS_PER_PAGE
	): Promise<[Avo.Assignment.Assignment[], number]> {
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

			const response = await dataService.query<
				GetAssignmentsAdminOverviewQuery,
				GetAssignmentsAdminOverviewQueryVariables
			>({
				query: GetAssignmentsAdminOverviewDocument,
				variables,
			});

			const assignments = response?.app_assignments_v2_overview;

			const assignmentCount =
				response?.app_assignments_v2_overview_aggregate?.aggregate?.count || 0;

			if (!assignments) {
				throw new CustomError('Response does not contain any assignments', null, {
					response,
				});
			}

			return [assignments as Avo.Assignment.Assignment[], assignmentCount];
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

			const response = await dataService.query<
				GetAssignmentIdsQuery,
				GetAssignmentIdsQueryVariables
			>({
				variables,
				query: GetAssignmentIdsDocument,
			});

			const assignmentIds: string[] = (response?.app_assignments_v2 || []).map(
				(assignment) => assignment.id
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

	static async getAssignmentsByTitleOrDescription(
		title: string,
		description: string | null,
		assignmentId: string
	): Promise<{ byTitle: boolean; byDescription: boolean }> {
		try {
			const variables: GetAssignmentByTitleOrDescriptionQueryVariables = {
				title,
				description: description || '',
				assignmentId,
			};

			const response = await dataService.query<
				GetAssignmentByTitleOrDescriptionQuery,
				GetAssignmentByTitleOrDescriptionQueryVariables
			>({ query: GetAssignmentByTitleOrDescriptionDocument, variables });

			const assignmentWithSameTitleExists = !!(response.assignmentByTitle || []).length;

			const assignmentWithSameDescriptionExists = !!(response.assignmentByDescription || [])
				.length;

			return {
				byTitle: assignmentWithSameTitleExists,
				byDescription: assignmentWithSameDescriptionExists,
			};
		} catch (err) {
			throw new CustomError(
				'Failed to get duplicate assignments by title or description',
				err,
				{ title, description, query: 'GET_ASSIGNMENT_BY_TITLE_OR_DESCRIPTION' }
			);
		}
	}

	static async changeAssignmentsAuthor(
		profileId: string,
		assignmentIds: string[]
	): Promise<number> {
		try {
			const response = await dataService.query<
				BulkUpdateAuthorForAssignmentsMutation,
				BulkUpdateAuthorForAssignmentsMutationVariables
			>({
				query: BulkUpdateAuthorForAssignmentsDocument,
				variables: {
					assignmentIds,
					authorId: profileId,
					now: new Date().toISOString(),
				},
			});

			return response?.update_app_assignments_v2?.affected_rows || 0;
		} catch (err) {
			throw new CustomError('Failed to update author for assignments in the database', err, {
				profileId,
				assignmentIds,
				query: 'BULK_UPDATE_AUTHOR_FOR_ASSIGNMENTS',
			});
		}
	}

	static async increaseViewCount(assignmentId: string): Promise<number> {
		try {
			const variables: IncrementAssignmentViewCountMutationVariables = {
				assignmentId,
			};
			const response = await dataService.query<
				IncrementAssignmentViewCountMutation,
				IncrementAssignmentViewCountMutationVariables
			>({
				query: IncrementAssignmentViewCountDocument,
				variables,
			});

			return response?.update_app_assignment_v2_views?.affected_rows || 0;
		} catch (err) {
			throw new CustomError('Failed to increase assignment view count in the database', err, {
				assignmentId,
				query: 'INCREMENT_ASSIGNMENT_VIEW_COUNT',
			});
		}
	}

	static async fetchContributorsByAssignmentId(assignmentId: string): Promise<Contributor[]> {
		try {
			const variables: GetContributorsByAssignmentUuidQueryVariables = { id: assignmentId };
			const response = await dataService.query<
				GetContributorsByAssignmentUuidQuery,
				GetContributorsByAssignmentUuidQueryVariables
			>({
				query: GetContributorsByAssignmentUuidDocument,
				variables,
			});

			const contributors = response.app_assignments_v2_contributors;

			if (!contributors) {
				throw new CustomError('Response does not contain contributors', null, {
					response,
				});
			}

			return contributors as Contributor[];
		} catch (err) {
			throw new CustomError(
				'Failed to get contributors by assignment id from database',
				err,
				{
					assignmentId,
					query: 'GET_CONTRIBUTORS_BY_ASSIGNMENT_UUID',
				}
			);
		}
	}

	static async addContributor(
		assignmentId: string,
		user: Partial<ContributorInfo>
	): Promise<void> {
		if (isNil(user.email) || isEmpty(user.email)) {
			throw new CustomError('User has no email address');
		}

		try {
			await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/add-contributor`,
					query: {
						email: user.email,
						rights: user.rights,
					},
				}),
				{ method: 'POST' }
			);
		} catch (err) {
			throw new CustomError('Failed to add assignment contributor', err, {
				assignmentId,
				user,
			});
		}
	}

	static async editContributorRights(
		assignmentId: string,
		contributorId: string,
		rights: ShareRightsType
	): Promise<void> {
		try {
			await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv(
						'PROXY_URL'
					)}/assignments/${assignmentId}/share/change-contributor-rights`,
					query: {
						contributorId,
						rights,
					},
				}),
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to edit assignment contributor rights', err, {
				assignmentId,
				rights,
				contributorId,
			});
		}
	}

	static async deleteContributor(
		assignmentId: string,
		contributorId?: string,
		profileId?: string
	): Promise<void> {
		try {
			await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv(
						'PROXY_URL'
					)}/assignments/${assignmentId}/share/delete-contributor`,
					query: {
						contributorId,
						profileId,
					},
				}),
				{ method: 'DELETE' }
			);
		} catch (err) {
			throw new CustomError('Failed to remove assignment contributor', err, {
				assignmentId,
				contributorId,
			});
		}
	}

	static async acceptSharedAssignment(
		assignmentId: string,
		inviteToken: string
	): Promise<Avo.Assignment.Contributor> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/accept-invite`,
					query: {
						inviteToken,
					},
				}),
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to accept to share assignment', err, {
				assignmentId,
				inviteToken,
			});
		}
	}

	static async declineSharedAssignment(assignmentId: string, inviteToken: string): Promise<void> {
		try {
			await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}/share/reject-invite`,
					query: {
						inviteToken,
					},
				}),
				{ method: 'DELETE' }
			);
		} catch (err) {
			throw new CustomError('Failed to decline to share assignment', err, {
				assignmentId,
				inviteToken,
			});
		}
	}

	static async transferAssignmentOwnerShip(
		assignmentId: string,
		contributorId: string
	): Promise<void> {
		try {
			await fetchWithLogoutJson(
				`${getEnv(
					'PROXY_URL'
				)}/assignments/${assignmentId}/share/transfer-owner?newOwnerId=${contributorId}`,
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to transfer assignment ownership', err, {
				contributorId,
			});
		}
	}

	static async insertAssignmentLomLinks(assignmentId: string, lomIds: string[]): Promise<void> {
		try {
			const uniqueLoms = uniq(lomIds);
			const lomObjects = uniqueLoms.map((lomId) => ({
				assignment_id: assignmentId,
				lom_id: lomId,
			}));

			const variables: InsertAssignmentLomLinksMutationVariables = { lomObjects };

			await dataService.query<
				InsertAssignmentLomLinksMutation,
				InsertAssignmentLomLinksMutationVariables
			>({
				query: InsertAssignmentLomLinksDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to insert lom links in assignment database', err, {
				assignmentId,
				lomIds,
				query: 'INSERT_ASSIGNMENT_LOM_LINKS',
			});
		}
	}

	static async deleteAssignmentLomLinks(assignmentId: string): Promise<void> {
		try {
			const variables: DeleteAssignmentLomLinksMutationVariables = { assignmentId };

			await dataService.query<
				DeleteAssignmentLomLinksMutation,
				DeleteAssignmentLomLinksMutationVariables
			>({
				query: DeleteAssignmentLomLinksDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to insert lom links in assignment database', err, {
				collectionId: assignmentId,
				query: 'DELETE_ASSIGNMENT_LOM_LINKS',
			});
		}
	}
}
