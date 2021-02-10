import { ApolloQueryResult } from 'apollo-boost';
import { cloneDeep, get, isNil, isString, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';
import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { ItemsService } from '../admin/items/items.service';
import { getProfileId } from '../authentication/helpers/get-profile-id';
import { CollectionService } from '../collection/collection.service';
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
	GET_ASSIGNMENT_BY_CONTENT_ID_AND_TYPE,
	GET_ASSIGNMENT_BY_UUID,
	GET_ASSIGNMENT_RESPONSES,
	GET_ASSIGNMENT_UUID_FROM_LEGACY_ID,
	GET_ASSIGNMENT_WITH_RESPONSE,
	INSERT_ASSIGNMENT,
	INSERT_ASSIGNMENT_RESPONSE,
	UPDATE_ASSIGNMENT,
	UPDATE_ASSIGNMENT_ARCHIVE_STATUS,
	UPDATE_ASSIGNMENT_RESPONSE_SUBMITTED_STATUS,
} from './assignment.gql';
import {
	AssignmentLayout,
	AssignmentOverviewTableColumns,
	AssignmentRetrieveError,
} from './assignment.types';

export const GET_ASSIGNMENT_COPY_PREFIX = () =>
	`${i18n.t('assignment/assignment___opdracht-kopie')} %index%: `;
export const GET_ASSIGNMENT_COPY_REGEX = () =>
	new RegExp(`^${i18n.t('assignment/assignment___opdracht-kopie')} [0-9]+`, 'gi');

interface AssignmentProperty {
	name: string;
	label: string;
}

const GET_OBLIGATORY_PROPERTIES = (): AssignmentProperty[] => [
	{
		name: 'title',
		label: i18n.t('assignment/assignment___titel'),
	},
	{
		name: 'description',
		label: i18n.t('assignment/assignment___beschrijving'),
	},
	{
		name: 'deadline_at',
		label: i18n.t('assignment/assignment___deadline'),
	},
	{
		name: 'class_room',
		label: i18n.t('assignment/assignment___klas-of-groep'),
	},
];

export class AssignmentService {
	static async fetchAssignments(
		canEditAssignments: boolean,
		user: Avo.User.User,
		archived: boolean | null,
		pastDeadline: boolean | null,
		sortColumn: AssignmentOverviewTableColumns,
		sortOrder: Avo.Search.OrderDirection,
		page: number,
		filterString: string | undefined,
		labelIds: string[] | undefined
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
							tags: {
								assignment_tag: { label: { _ilike: `%${trimmedFilterString}%` } },
							},
						},
						{ class_room: { _ilike: `%${trimmedFilterString}%` } },
						{ assignment_type: { _ilike: `%${trimmedFilterString}%` } },
					],
				});
			}
			if (labelIds && labelIds.length) {
				filterArray.push({
					tags: { assignment_tag_id: { _in: labelIds } },
				});
			}
			if (!isNil(archived)) {
				filterArray.push({
					is_archived: { _eq: archived },
				});
			}
			if (!isNil(pastDeadline)) {
				if (pastDeadline) {
					filterArray.push({
						deadline_at: { _lt: new Date().toISOString() },
					});
				} else {
					filterArray.push({
						deadline_at: { _gt: new Date().toISOString() },
					});
				}
			}
			variables = {
				order: getOrderObject(sortColumn, sortOrder, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT),
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
				(!assignmentResponse.app_assignments &&
					!assignmentResponse.app_assignment_responses) ||
				!assignmentResponse.count
			) {
				throw new CustomError('Response does not have the expected format', null, {
					assignmentResponse,
				});
			}

			return {
				assignments: get(assignmentResponse, 'app_assignments', []),
				count: get(assignmentResponse, 'aggregate.count', 0),
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

	static async fetchAssignmentByUuid(assignmentUuid: string): Promise<Avo.Assignment.Assignment> {
		try {
			const assignmentQuery = {
				query: GET_ASSIGNMENT_BY_UUID,
				variables: { uuid: assignmentUuid },
			};

			// Get the assignment from graphql
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
				assignmentQuery
			);

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const assignmentResponse: Avo.Assignment.Assignment | undefined = get(
				response,
				'data.app_assignments[0]'
			);

			if (!assignmentResponse) {
				throw new CustomError('Response does not contain any assignment response', null, {
					assignmentResponse,
				});
			}

			return assignmentResponse;
		} catch (err) {
			throw new CustomError('Failed to get assignment by id from database', err, {
				assignmentUuid,
				query: 'GET_ASSIGNMENT_BY_UUID',
			});
		}
	}

	static async fetchAssignmentContent(
		assignment: Partial<Avo.Assignment.Assignment>
	): Promise<Avo.Assignment.Content | null> {
		if (assignment.content_id && assignment.content_label) {
			if (assignment.content_label === 'COLLECTIE' && assignment.content_id) {
				return (
					(await CollectionService.fetchCollectionOrBundleById(
						assignment.content_id,
						'collection',
						assignment.uuid
					)) || null
				);
			}
			if (assignment.content_label === 'ITEM' && assignment.content_id) {
				return (await ItemsService.fetchItemByExternalId(assignment.content_id)) || null;
			}
		}

		return null;
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
	private static validateAssignment(
		assignment: Partial<Avo.Assignment.Assignment>
	): [string[], Avo.Assignment.Assignment] {
		const assignmentToSave = cloneDeep(assignment);
		const errors: string[] = [];

		// Validate obligatory fields
		GET_OBLIGATORY_PROPERTIES().forEach((prop: AssignmentProperty) => {
			if (!(assignmentToSave as any)[prop.name]) {
				errors.push(
					i18n.t('assignment/assignment___een-eigenschap-is-verplicht', {
						eigenschap: prop.label,
					})
				);
			}
		});

		assignmentToSave.content_layout =
			assignmentToSave.content_layout || AssignmentLayout.PlayerAndText;
		if (assignmentToSave.answer_url && !/^(https?:)?\/\//.test(assignmentToSave.answer_url)) {
			assignmentToSave.answer_url = `//${assignmentToSave.answer_url}`;
		}

		assignmentToSave.owner_profile_id = assignmentToSave.owner_profile_id || 'owner_profile_id';
		assignmentToSave.is_archived = assignmentToSave.is_archived || false;
		assignmentToSave.is_deleted = assignmentToSave.is_deleted || false;
		assignmentToSave.is_collaborative = assignmentToSave.is_collaborative || false;
		assignmentToSave.description =
			(assignmentToSave as any).descriptionRichEditorState &&
			(assignmentToSave as any).descriptionRichEditorState.toHTML
				? (assignmentToSave as any).descriptionRichEditorState.toHTML()
				: assignmentToSave.description || '';

		delete (assignmentToSave as any).responses;
		delete (assignmentToSave as any).tags;
		delete (assignmentToSave as any).__typename;
		delete (assignmentToSave as any).descriptionRichEditorState;

		return [errors, assignmentToSave as Avo.Assignment.Assignment];
	}

	static async deleteAssignment(assignmentUuid: number | string) {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENT,
				variables: { assignmentUuid },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			const error = new CustomError('Failed to delete assignment', err, { assignmentUuid });
			console.error(error);
			throw error;
		}
	}

	static async updateAssignment(
		assignment: Partial<Avo.Assignment.Assignment>,
		initialLabels?: Avo.Assignment.Label[],
		updatedLabels?: Avo.Assignment.Label[]
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			if (isNil(assignment.uuid)) {
				throw new CustomError(
					'Failed to update assignment because its id is undefined',
					null,
					assignment
				);
			}

			const [validationErrors, assignmentToSave] = AssignmentService.validateAssignment({
				...assignment,
			});

			if (validationErrors.length) {
				ToastService.danger(validationErrors);
				return null;
			}

			AssignmentService.warnAboutDeadlineInThePast(assignmentToSave);

			const response = await dataService.mutate<Avo.Assignment.Assignment>({
				mutation: UPDATE_ASSIGNMENT,
				variables: {
					assignmentUuid: assignment.uuid,
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
					AssignmentLabelsService.linkLabelsFromAssignment(
						assignment.uuid as string,
						newLabelIds
					),
					AssignmentLabelsService.unlinkLabelsFromAssignment(
						assignment.uuid as string,
						deletedLabelIds
					),
				]);
			}

			return assignment as Avo.Assignment.Assignment;
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

	static async toggleAssignmentArchiveStatus(
		assignmentUuid: string,
		archived: boolean
	): Promise<void> {
		try {
			const response = await dataService.mutate<Avo.Assignment.Assignment>({
				mutation: UPDATE_ASSIGNMENT_ARCHIVE_STATUS,
				variables: {
					assignmentUuid,
					archived,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (response.errors) {
				throw new CustomError('Graphql response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to toggle archived status for assignment', err, {
				assignmentUuid,
				archived,
			});
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
		assignment: Partial<Avo.Assignment.Assignment>,
		addedLabels?: Avo.Assignment.Label[]
	): Promise<Avo.Assignment.Assignment | null> {
		try {
			const [validationErrors, assignmentToSave] = AssignmentService.validateAssignment({
				...assignment,
			});

			if (validationErrors.length) {
				ToastService.danger(validationErrors);
				return null;
			}

			AssignmentService.warnAboutDeadlineInThePast(assignmentToSave);

			const response = await dataService.mutate<Avo.Assignment.Assignment>({
				mutation: INSERT_ASSIGNMENT,
				variables: {
					assignment: assignmentToSave,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			const assignmentUuid = get(response, 'data.insert_app_assignments.returning[0].uuid');
			const assignmentId = get(response, 'data.insert_app_assignments.returning[0].id');

			if (isNil(assignmentUuid)) {
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
				const addedLabelIds = addedLabels.map((labelObj) => labelObj.id);

				await Promise.all([
					AssignmentLabelsService.linkLabelsFromAssignment(assignmentUuid, addedLabelIds),
				]);
			}

			return {
				...(assignment as Avo.Assignment.Assignment), // Do not copy the auto modified fields from the validation back into the input controls
				uuid: assignmentUuid,
				id: assignmentId,
			};
		} catch (err) {
			throw new CustomError('Failed to insert assignment', err, { assignment, addedLabels });
		}
	}

	static async insertDuplicateAssignment(
		title: string,
		assignment: Partial<Avo.Assignment.Assignment> | null
	): Promise<Avo.Assignment.Assignment | null> {
		if (!assignment) {
			ToastService.danger(
				i18n.t('assignment/assignment___de-opdracht-is-niet-beschikbaar-om-te-dupliceren')
			);
			return null;
		}

		const newAssignment = {
			...cloneDeep(assignment),
			title,
		};

		delete newAssignment.id;
		delete newAssignment.uuid;

		try {
			return await AssignmentService.insertAssignment(newAssignment);
		} catch (err) {
			console.error(
				new CustomError('Failed to insert duplicate assignment', err, { title, assignment })
			);
			ToastService.danger(
				i18n.t('assignment/assignment___het-dupliceren-van-de-opdracht-is-mislukt')
			);
			return null;
		}
	}

	static async duplicateCollectionForAssignment(
		collectionIdOrCollection: string | Avo.Collection.Collection,
		user: Avo.User.User
	): Promise<string> {
		let collection: Avo.Collection.Collection | null;
		if (isString(collectionIdOrCollection)) {
			collection = await CollectionService.fetchCollectionOrBundleById(
				collectionIdOrCollection as string,
				'collection',
				undefined,
				true
			);
		} else {
			collection = collectionIdOrCollection as Avo.Collection.Collection;
		}
		if (!collection) {
			throw new CustomError('The collection for this assignment could not be loaded', null, {
				collectionIdOrCollection,
			});
		}
		const collectionCopy = await CollectionService.duplicateCollection(
			collection,
			user,
			GET_ASSIGNMENT_COPY_PREFIX(),
			GET_ASSIGNMENT_COPY_REGEX()
		);
		if (!collectionCopy) {
			throw new CustomError('Failed to copy collection', null);
		}
		return collectionCopy.id;
	}

	static async duplicateAssignment(
		newTitle: string,
		initialAssignment: Partial<Avo.Assignment.Assignment> | null,
		user: Avo.User.User
	): Promise<Avo.Assignment.Assignment> {
		if (!initialAssignment || !initialAssignment.content_label) {
			throw new CustomError(
				'Failed to copy assignment because the duplicateAssignment function received an empty assignment or an assignment without content_label',
				null,
				{ newTitle, initialAssignment }
			);
		}
		// Copy collection if not own collection
		let duplicateCollectionId: string | null = null;
		if ((initialAssignment.content_label || '') === 'COLLECTIE') {
			if (!initialAssignment.content_id) {
				throw new CustomError(
					'The assignment content label sais collection, but the collection could not be found by assignment.content_id',
					null,
					{ initialAssignment }
				);
			}
			duplicateCollectionId = await AssignmentService.duplicateCollectionForAssignment(
				initialAssignment.content_id,
				user
			);
		}

		let duplicatedAssignment: Avo.Assignment.Assignment | null;
		if (!isNil(duplicateCollectionId)) {
			// Insert the duplicated assignment with its duplicated collection id
			duplicatedAssignment = await AssignmentService.insertDuplicateAssignment(newTitle, {
				...initialAssignment,
				content_id: duplicateCollectionId,
			});
		} else {
			// other assignments do not need to have their content_id updated
			duplicatedAssignment = await AssignmentService.insertDuplicateAssignment(
				newTitle,
				initialAssignment
			);
		}

		if (!duplicatedAssignment) {
			throw new CustomError(
				'Failed to copy assignment because the insert method returned null',
				null,
				{
					newTitle,
					initialAssignment,
					user,
				}
			);
		}

		return duplicatedAssignment;
	}

	private static warnAboutDeadlineInThePast(assignment: Avo.Assignment.Assignment) {
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
		assignmentUuid: string
	): Promise<
		| {
				assignmentContent: Avo.Assignment.Content | null;
				assignment: Avo.Assignment.Assignment;
		  }
		| AssignmentRetrieveError
	> {
		try {
			// Load assignment
			const response: ApolloQueryResult<Avo.Assignment.Assignment> = await dataService.query({
				query: GET_ASSIGNMENT_WITH_RESPONSE,
				variables: {
					assignmentUuid,
					pupilUuid: pupilProfileId,
				},
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, response);
			}

			const tempAssignment: Avo.Assignment.Assignment | undefined | null = get(
				response,
				'data.assignments[0]'
			);

			if (!tempAssignment) {
				throw new CustomError('Failed to find assignment by id');
			}

			// Load content (collection, item or search query) according to assignment
			const assignmentContent: Avo.Assignment.Content | null = await AssignmentService.fetchAssignmentContent(
				tempAssignment
			);

			return {
				assignmentContent,
				assignment: tempAssignment,
			};
		} catch (err) {
			const graphqlError = get(err, 'graphQLErrors[0].message');
			if (graphqlError) {
				return graphqlError;
			}

			throw new CustomError('Failed to fetch assignment with content', err, {
				pupilProfileId,
				assignmentUuid,
			});
		}
	}

	static isOwnerOfAssignment(
		assignment: Avo.Assignment.Assignment,
		user: Avo.User.User | undefined
	) {
		return getProfileId(user) === assignment.owner_profile_id;
	}

	static async getAssignmentResponses(
		profileId: string,
		assignmentUuid: string
	): Promise<string[]> {
		try {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: GET_ASSIGNMENT_RESPONSES,
				variables: { profileId, assignmentUuid },
				fetchPolicy: 'no-cache',
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			return (get(response, 'data.app_assignment_responses') || []).map(
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
		assignment: Avo.Assignment.Assignment,
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
				get(assignment, 'uuid')
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
			const assignmentResponse: Partial<Avo.Assignment.Response> = {
				owner_profile_ids: [getProfileId(user)],
				assignment_uuid: assignment.uuid,
				collection: null,
				collection_uuid: null,
				submitted_at: null,
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
				'data.insert_app_assignment_responses.returning[0]'
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

	static isLegacyAssignmentId(assignmentId: string | number): boolean {
		return !String(assignmentId).includes('-');
	}

	static async getAssignmentUuidFromLegacyId(
		legacyAssignmentId: string | number
	): Promise<string | undefined> {
		try {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: GET_ASSIGNMENT_UUID_FROM_LEGACY_ID,
				variables: { legacyId: legacyAssignmentId },
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			return get(response, 'data.app_assignments[0].uuid');
		} catch (err) {
			throw new CustomError(
				'Failed to get assignment uuid from legacy id from the database',
				err,
				{
					legacyAssignmentId,
					query: 'GET_ASSIGNMENT_UUID_FROM_LEGACY_ID',
				}
			);
		}
	}
}
