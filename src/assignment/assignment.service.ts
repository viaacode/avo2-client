import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { type Avo } from '@viaa/avo2-types';
import { cloneDeep, compact, isEmpty, isNil } from 'lodash-es';
import { stringifyUrl } from 'query-string';

import { ItemsService } from '../admin/items/items.service';
import { SpecialUserGroup } from '../admin/user-groups/user-group.const';
import { getUserGroupIds } from '../authentication/authentication.service';
import { getProfileId } from '../authentication/helpers/get-profile-id';
import { type ItemTrimInfo } from '../item/item.types';
import { PupilCollectionService } from '../pupil-collection/pupil-collection.service';
import {
	type ContributorInfo,
	type ContributorInfoRight,
} from '../shared/components/ShareWithColleagues/ShareWithColleagues.types';
import {
	type AssignmentPupilBlocksQuery,
	type AssignmentPupilBlocksQueryVariables,
	type BulkUpdateAuthorForAssignmentsMutation,
	type BulkUpdateAuthorForAssignmentsMutationVariables,
	type DeleteAssignmentResponseByIdMutation,
	type DeleteAssignmentResponseByIdMutationVariables,
	type DeleteAssignmentsByIdMutation,
	type DeleteAssignmentsByIdMutationVariables,
	type GetAssignmentBlocksQuery,
	type GetAssignmentBlocksQueryVariables,
	type GetAssignmentByTitleOrDescriptionQuery,
	type GetAssignmentByTitleOrDescriptionQueryVariables,
	type GetAssignmentIdsQuery,
	type GetAssignmentIdsQueryVariables,
	type GetAssignmentResponseByIdQuery,
	type GetAssignmentResponseByIdQueryVariables,
	type GetAssignmentResponseQuery,
	type GetAssignmentResponseQueryVariables,
	type GetAssignmentResponsesByAssignmentIdQuery,
	type GetAssignmentResponsesByAssignmentIdQueryVariables,
	type GetAssignmentResponsesQuery,
	type GetAssignmentResponsesQueryVariables,
	type GetAssignmentsAdminOverviewQuery,
	type GetAssignmentsAdminOverviewQueryVariables,
	type GetAssignmentsByOwnerOrContributorQuery,
	type GetAssignmentsByOwnerOrContributorQueryVariables,
	type GetAssignmentsByResponseOwnerIdQuery,
	type GetAssignmentsByResponseOwnerIdQueryVariables,
	type GetAssignmentWithResponseQuery,
	type GetAssignmentWithResponseQueryVariables,
	type GetContributorsByAssignmentUuidQuery,
	type GetContributorsByAssignmentUuidQueryVariables,
	type GetMaxPositionAssignmentBlocksQuery,
	type GetMaxPositionAssignmentBlocksQueryVariables,
	type IncrementAssignmentViewCountMutation,
	type IncrementAssignmentViewCountMutationVariables,
	type InsertAssignmentBlocksMutation,
	type InsertAssignmentBlocksMutationVariables,
	type InsertAssignmentResponseMutation,
	type InsertAssignmentResponseMutationVariables,
	type SoftDeleteAssignmentByIdMutation,
	type SoftDeleteAssignmentByIdMutationVariables,
	type UpdateAssignmentResponseMutation,
	type UpdateAssignmentResponseMutationVariables,
	type UpdateAssignmentUpdatedAtDateMutation,
	type UpdateAssignmentUpdatedAtDateMutationVariables,
} from '../shared/generated/graphql-db-operations';
import {
	AssignmentPupilBlocksDocument,
	BulkUpdateAuthorForAssignmentsDocument,
	DeleteAssignmentResponseByIdDocument,
	DeleteAssignmentsByIdDocument,
	GetAssignmentBlocksDocument,
	GetAssignmentByTitleOrDescriptionDocument,
	GetAssignmentIdsDocument,
	GetAssignmentResponseByIdDocument,
	GetAssignmentResponseDocument,
	GetAssignmentResponsesByAssignmentIdDocument,
	GetAssignmentResponsesDocument,
	GetAssignmentsAdminOverviewDocument,
	GetAssignmentsByOwnerOrContributorDocument,
	GetAssignmentsByResponseOwnerIdDocument,
	GetAssignmentWithResponseDocument,
	GetContributorsByAssignmentUuidDocument,
	GetMaxPositionAssignmentBlocksDocument,
	IncrementAssignmentViewCountDocument,
	InsertAssignmentBlocksDocument,
	InsertAssignmentResponseDocument,
	SoftDeleteAssignmentByIdDocument,
	UpdateAssignmentResponseDocument,
	UpdateAssignmentUpdatedAtDateDocument,
} from '../shared/generated/graphql-db-react-query';
import {
	type App_Assignments_V2_Insert_Input,
	type App_Assignments_V2_Set_Input,
	type App_Pupil_Collection_Blocks,
	Lookup_Enum_Relation_Types_Enum,
} from '../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../shared/helpers';
import { getOrderObject } from '../shared/helpers/generate-order-gql-query';
import { tHtml, tText } from '../shared/helpers/translate';
import { dataService } from '../shared/services/data-service';
import { trackEvents } from '../shared/services/event-logging-service';
import { RelationService } from '../shared/services/relation-service/relation.service';
import { ToastService } from '../shared/services/toast-service';
import { VideoStillService } from '../shared/services/video-stills-service';
import { type Positioned } from '../shared/types';
import { type TableColumnDataType } from '../shared/types/table-column-data-type';

import {
	ASSIGNMENTS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
	ITEMS_PER_PAGE,
	RESPONSE_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './assignment.const';
import { reorderBlockPositions } from './assignment.helper';
import {
	AssignmentBlockType,
	type AssignmentOverviewTableColumns,
	AssignmentType,
	type PupilCollectionFragment,
} from './assignment.types';
import { endOfAcademicYear, startOfAcademicYear } from './helpers/academic-year';
import { cleanupTitleAndDescriptions } from './helpers/cleanup-title-and-descriptions';
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
		shareTypeIds: string[] | undefined,
		limit: number | null = ITEMS_PER_PAGE
	): Promise<{
		assignments: Avo.Assignment.Assignment[];
		count: number;
	}> {
		let variables:
			| GetAssignmentsByOwnerOrContributorQueryVariables
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
			if (shareTypeIds?.length) {
				filterArray.push({
					share_type: { _in: shareTypeIds },
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

			if (getUserGroupIds(user).includes(SpecialUserGroup.PupilSecondary)) {
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
				...(canEditAssignments
					? { collaborator_profile_id: getProfileId(user) }
					: { owner_profile_id: getProfileId(user) }),
				filter: filterArray.length ? filterArray : {},
			};

			// Get the assignment from graphql
			const assignmentResponse = await dataService.query<
				GetAssignmentsByOwnerOrContributorQuery | GetAssignmentsByResponseOwnerIdQuery,
				| GetAssignmentsByOwnerOrContributorQueryVariables
				| GetAssignmentsByResponseOwnerIdQueryVariables
			>({
				variables,
				query: canEditAssignments
					? GetAssignmentsByOwnerOrContributorDocument
					: GetAssignmentsByResponseOwnerIdDocument,
			});

			const assignments =
				(assignmentResponse as GetAssignmentsByOwnerOrContributorQuery)
					?.app_assignments_v2_overview ||
				(assignmentResponse as GetAssignmentsByResponseOwnerIdQuery)?.app_assignments_v2;
			if (!assignments || isNil(assignmentResponse.count)) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			return {
				assignments: (assignments || []) as unknown as Avo.Assignment.Assignment[],
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
		assignmentId: string,
		inviteToken?: string
	): Promise<Avo.Assignment.Assignment> {
		try {
			const url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/assignments/${assignmentId}`,
				query: {
					inviteToken: inviteToken || undefined,
				},
			});
			const assignment: Avo.Assignment.Assignment = await fetchWithLogoutJson(url, {
				method: 'GET',
			});

			if (!assignment) {
				throw new CustomError('Response does not contain an assignment', null, {
					response: assignment,
				});
			}

			return {
				...assignment,
				blocks: (await this.enrichBlocksWithMeta(
					assignment.blocks
				)) as Avo.Assignment.Block[],
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

	static async fetchAssignmentBlocks(assignmentId: string): Promise<Avo.Assignment.Block[]> {
		const blocks = await dataService.query<
			GetAssignmentBlocksQuery,
			GetAssignmentBlocksQueryVariables
		>({
			query: GetAssignmentBlocksDocument,
			variables: { assignmentId },
		});

		return reorderBlockPositions(blocks.app_assignment_blocks_v2) as Avo.Assignment.Block[];
	}

	/**
	 * Helper functions for inserting, updating, validating and deleting assignment
	 * This will be used by the Assignments view and the AssignmentEdit view
	 * @param assignment
	 * @param profileId
	 */
	private static async transformAssignment(
		assignment: Partial<Avo.Assignment.Assignment>,
		profileId: string
	): Promise<App_Assignments_V2_Insert_Input | App_Assignments_V2_Set_Input> {
		const assignmentToSave = cloneDeep(assignment);

		if (assignmentToSave.answer_url && !/^(https?:)?\/\//.test(assignmentToSave.answer_url)) {
			assignmentToSave.answer_url = `//${assignmentToSave.answer_url}`;
		}

		assignmentToSave.updated_by_profile_id = profileId;
		assignmentToSave.owner_profile_id = assignmentToSave.owner_profile_id || 'owner_profile_id';
		assignmentToSave.is_deleted = assignmentToSave.is_deleted || false;
		assignmentToSave.is_collaborative = assignmentToSave.is_collaborative || false;
		assignmentToSave.description =
			(assignmentToSave as any).descriptionRichEditorState &&
			(assignmentToSave as any).descriptionRichEditorState.toHTML
				? (assignmentToSave as any).descriptionRichEditorState.toHTML()
				: assignmentToSave.description || '';

		if (!isNil(assignment.blocks)) {
			assignmentToSave.blocks = cleanupTitleAndDescriptions(
				assignment.blocks
			) as Avo.Assignment.Block[];
		}

		if (isNil(assignment.thumbnail_path)) {
			assignmentToSave.thumbnail_path = await this.getThumbnailPathForAssignment(assignment);
		}

		delete assignmentToSave.owner;
		delete assignmentToSave.profile;
		delete assignmentToSave.responses;
		delete (assignmentToSave as any).__typename;
		delete (assignmentToSave as any).descriptionRichEditorState;
		delete assignmentToSave.contributors;
		delete assignmentToSave.updated_by;

		return assignmentToSave as Avo.Assignment.Assignment;
	}

	static async deleteAssignment(assignmentId: string): Promise<void> {
		try {
			await dataService.query<
				SoftDeleteAssignmentByIdMutation,
				SoftDeleteAssignmentByIdMutationVariables
			>({
				query: SoftDeleteAssignmentByIdDocument,
				variables: { assignmentId, now: new Date().toISOString() },
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
		assignment: Partial<Avo.Assignment.Assignment>,
		profileId: string
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			const updatedAssignment = await this.transformAssignment(assignment, profileId);

			return await fetchWithLogoutJson(
				`${getEnv('PROXY_URL')}/assignments/${updatedAssignment.id}`,
				{
					method: 'PATCH',
					body: JSON.stringify(updatedAssignment),
				}
			);
		} catch (err) {
			const error = new CustomError('Failed to update assignment', err, {
				assignment,
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
		original: Omit<Avo.Assignment.Response, 'assignment'>,
		update: {
			collection_title: string;
			pupil_collection_blocks: PupilCollectionFragment[];
		}
	): Promise<Omit<Avo.Assignment.Response, 'assignment'> | null> {
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
			} as Omit<Avo.Assignment.Response, 'assignment'>;
		} catch (err) {
			const error = new CustomError('Failed to update assignment', err, {
				original,
				update,
			});

			console.error(error);
			throw error;
		}
	}

	static async insertAssignment(
		assignment: Partial<Avo.Assignment.Assignment>,
		profileId: string
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			const assignmentToSave = await AssignmentService.transformAssignment(
				{
					...assignment,
				},
				profileId
			);

			return await fetchWithLogoutJson(`${getEnv('PROXY_URL')}/assignments`, {
				method: 'POST',
				body: JSON.stringify(assignmentToSave),
			});
		} catch (err) {
			throw new CustomError('Failed to insert assignment', err, { assignment });
		}
	}

	static async duplicateAssignment(
		newTitle: string,
		initialAssignment: Partial<Avo.Assignment.Assignment> | null,
		profileId: string
	): Promise<Avo.Assignment.Assignment> {
		if (!initialAssignment || !initialAssignment.id) {
			throw new CustomError(
				'Failed to copy assignment because the duplicateAssignment function received an empty assignment',
				null,
				{ newTitle, initialAssignment }
			);
		}

		// clone the assignment
		const newAssignment: Partial<Avo.Assignment.Assignment> = {
			...cloneDeep(initialAssignment),
			title: newTitle,
			owner_profile_id: profileId,
			available_at: new Date().toISOString(),
			deadline_at: null,
			answer_url: null,
			is_public: false,
			created_at: new Date().toISOString(),
			published_at: undefined,
			contributors: [],
			labels: [],
			note: null,
		};

		delete newAssignment.owner;
		newAssignment.updated_at = new Date().toISOString();
		const blocks: Avo.Assignment.Block[] = await AssignmentService.fetchAssignmentBlocks(
			initialAssignment.id
		);
		const duplicatedAssignment = await AssignmentService.insertAssignment(
			{
				...newAssignment,
				blocks,
			},
			profileId
		);

		if (!duplicatedAssignment) {
			throw new CustomError(
				'Failed to copy assignment because the insert method returned null',
				null,
				{
					newTitle,
					initialAssignment,
				}
			);
		} else {
			await RelationService.insertRelation(
				'assignment',
				duplicatedAssignment.id,
				Lookup_Enum_Relation_Types_Enum.IsCopyOf,
				initialAssignment.id
			);
		}

		return duplicatedAssignment;
	}

	static async fetchAssignmentAndContent(
		pupilProfileId: string,
		assignmentId: string
	): Promise<Avo.Assignment.Assignment> {
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

			const tempAssignment = response.app_assignments_v2[0];

			if (!tempAssignment) {
				throw new CustomError('Failed to find assignment by id');
			}

			// Load content (collection, item or search query) according to assignment
			const initialAssignmentBlocks: Avo.Assignment.Block[] =
				await AssignmentService.fetchAssignmentBlocks(assignmentId);

			const blocks = await this.enrichBlocksWithMeta(initialAssignmentBlocks);

			return {
				...tempAssignment,
				blocks,
			} as unknown as Avo.Assignment.Assignment;
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
		assignmentResponses: Avo.Assignment.Response[];
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

			const assignmentResponses: Avo.Assignment.Response[] =
				(assignmentResponse.app_assignment_responses_v2 || []) as Avo.Assignment.Response[];

			// Enrich assignmentResponses with item infos
			const fragmentExternalIds = compact(
				assignmentResponses.flatMap(
					(response) =>
						response.pupil_collection_blocks?.map(
							(block) => (block as App_Pupil_Collection_Blocks).fragment_id
						)
				)
			);
			const itemMetas = await ItemsService.fetchItemsByExternalIds(fragmentExternalIds);
			assignmentResponses.forEach((response) => {
				response.pupil_collection_blocks?.forEach((block) => {
					(block as any).item_meta = itemMetas.find(
						(itemMeta) =>
							!!itemMeta?.external_id &&
							itemMeta?.external_id ===
								(block as App_Pupil_Collection_Blocks).fragment_id
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
	static async enrichBlocksWithMeta(
		blocks?: Avo.Core.BlockItemBase[],
		items: (Avo.Item.Item | null)[] = []
	): Promise<Avo.Core.BlockItemBase[]> {
		const enriched = await Promise.all(
			(blocks || []).map(async (block): Promise<Avo.Core.BlockItemBase> => {
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
						};
					} catch (error) {
						console.warn(`Unable to fetch meta data for ${block.fragment_id}`, error);
					}
				}

				return block;
			})
		);

		return enriched.filter(isItemWithMeta);
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
	): Promise<Omit<Avo.Assignment.Response, 'assignment'> | undefined> {
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
				owner: assignmentResponse.owner || undefined,
				pupil_collection_blocks: await AssignmentService.enrichBlocksWithMeta(
					assignmentResponse.pupil_collection_blocks as Avo.Core.BlockItemBase[]
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
	): Promise<Avo.Assignment.Response | null> {
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
				pupil_collection_blocks: await AssignmentService.enrichBlocksWithMeta(
					assignmentResponse.pupil_collection_blocks as Avo.Core.BlockItemBase[]
				),
			} as Avo.Assignment.Response | null;
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
	): Promise<Omit<Avo.Assignment.Response, 'assignment'> | null> {
		try {
			if (!user || !user.profile) {
				return null;
			}
			const existingAssignmentResponse:
				| Omit<Avo.Assignment.Response, 'assignment'>
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
			const assignmentResponse: Partial<Avo.Assignment.Response> = {
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
				owner: assignmentResponse.owner || undefined,
				pupil_collection_blocks: await this.enrichBlocksWithMeta(
					insertedAssignmentResponse.pupil_collection_blocks as Avo.Core.BlockItemBase[]
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
			const currentMaxPosition =
				await AssignmentService.getAssignmentBlockMaxPosition(assignmentId);
			const startPosition = currentMaxPosition === null ? 0 : currentMaxPosition + 1;
			const blocks = reorderBlockPositions(
				collection.collection_fragments.map((fragment: any, index: number) => {
					const block: Partial<Avo.Assignment.Block> = {
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
				}) as Positioned[]
			) as Avo.Assignment.Block[];
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
		const assignment = await AssignmentService.insertAssignment(
			{
				title: collection.title,
				description: collection.description ?? undefined,
				owner_profile_id: getProfileId(user),
			},
			user.profile?.id as string
		);

		const assignmentId = assignment?.id;

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
		// Track import collection into assignment event
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
		item: Avo.Item.Item & {
			start_oc?: number | null;
			end_oc?: number | null;
		}
	): Promise<string> {
		const assignment = await AssignmentService.insertAssignment(
			{
				title: item.title,
				owner_profile_id: getProfileId(user),
				blocks: [
					{
						fragment_id: item.external_id,
						type: AssignmentBlockType.ITEM,
						position: 0,
						start_oc: item.start_oc || null,
						end_oc: item.end_oc || null,
						thumbnail_path: item.start_oc
							? await VideoStillService.getVideoStill(
									item.external_id,
									item.start_oc * 1000
							  )
							: null,
					},
				] as Avo.Assignment.Assignment['blocks'],
			},
			user.profile?.id as string
		);

		if (!assignment) {
			throw new CustomError(
				'Saving the assignment failed, assignment id was undefined',
				null,
				{
					assignment,
				}
			);
		}

		return assignment.id;
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
		const thumbnailPath = trimInfo.hasCut
			? await VideoStillService.getVideoStill(
					item.external_id,
					trimInfo.fragmentStartTime * 1000
			  )
			: null;

		// Determine block position
		const currentMaxPosition =
			await AssignmentService.getAssignmentBlockMaxPosition(assignmentId);
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

			const assignments = response?.app_assignments_v2;

			const assignmentCount = response?.app_assignments_v2_aggregate?.aggregate?.count || 0;

			if (!assignments) {
				throw new CustomError('Response does not contain any assignments', null, {
					response,
				});
			}

			// also fetch if the assignment is a copy in a separate query to avoid making the main query slower
			const relations = (await RelationService.fetchRelationsBySubject(
				'assignment',
				assignments.map((coll) => coll.id),
				Lookup_Enum_Relation_Types_Enum.IsCopyOf
			)) as Avo.Assignment.RelationEntry<Avo.Assignment.Assignment>[];

			relations.forEach((relation) => {
				const assignment = assignments.find((coll) => coll.id === relation.subject);
				if (assignment) {
					(assignment as unknown as Avo.Assignment.Assignment).relations = [relation];
				}
			});

			return [assignments as unknown as Avo.Assignment.Assignment[], assignmentCount];
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
	): Promise<{
		byTitle: boolean;
		byDescription: boolean;
	}> {
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

	private static async getThumbnailPathForAssignment(
		assignment: Partial<Avo.Assignment.Assignment>
	): Promise<string | null> {
		try {
			if (!assignment.thumbnail_path) {
				return await VideoStillService.getThumbnailForSubject(assignment);
			}

			return assignment.thumbnail_path;
		} catch (err) {
			const customError = new CustomError(
				'Failed to get the thumbnail path for assignment',
				err,
				{
					collection: assignment,
				}
			);
			console.error(customError);

			ToastService.danger([
				tHtml(
					'assignment/assignment___het-ophalen-van-de-eerste-video-afbeelding-is-mislukt'
				),
				tHtml(
					'assignment/assignment___de-opdracht-zal-opgeslagen-worden-zonder-video-afbeelding'
				),
			]);

			return null;
		}
	}

	static async fetchContributorsByAssignmentId(
		assignmentId: string
	): Promise<Avo.Assignment.Contributor[]> {
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

			return contributors as Avo.Assignment.Contributor[];
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
		rights: ContributorInfoRight
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
		contributorProfileId: string
	): Promise<void> {
		try {
			await fetchWithLogoutJson(
				`${getEnv(
					'PROXY_URL'
				)}/assignments/${assignmentId}/share/transfer-owner?newOwnerProfileId=${contributorProfileId}`,
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to transfer assignment ownership', err, {
				contributorProfileId,
			});
		}
	}

	static async updateAssignmentEditor(assignmentId: string): Promise<void> {
		try {
			await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv(
						'PROXY_URL'
					)}/assignments/${assignmentId}/share/request-edit-status`,
				}),
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to update assignment current editor', err, {
				assignmentId,
			});
		}
	}

	static async getAssignmentsEditStatuses(ids: string[]): Promise<Avo.Share.EditStatusResponse> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/assignments/share/edit-status`,
					query: { ids },
				}),
				{ method: 'GET' }
			);
		} catch (err) {
			throw new CustomError('Failed to get assignment(s) edit status(es)', err, {
				assignmentIds: ids,
			});
		}
	}

	static async releaseAssignmentEditStatus(
		assignmentId: string
	): Promise<Avo.Share.EditStatusResponse> {
		try {
			return await fetchWithLogoutJson(
				stringifyUrl({
					url: `${getEnv(
						'PROXY_URL'
					)}/assignments/${assignmentId}/share/release-edit-status`,
				}),
				{ method: 'PATCH' }
			);
		} catch (err) {
			throw new CustomError('Failed to release assignment edit status', err, {
				assignmentId,
			});
		}
	}
}
