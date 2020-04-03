import { ExecutionResult } from '@apollo/react-common';
import { ApolloQueryResult } from 'apollo-boost';
import { cloneDeep, get, isNil, isString } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../shared/services';
import i18n from '../shared/translations/i18n';

import { CollectionService } from '../collection/collection.service';
import {
	DELETE_ASSIGNMENT,
	GET_ASSIGNMENT_BY_ID,
	INSERT_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
} from './assignment.gql';
import { AssignmentLayout } from './assignment.types';

export const GET_ASSIGNMENT_COPY_PREFIX = () => `${i18n.t('Opdracht kopie')} %index%: `;
export const GET_ASSIGNMENT_COPY_REGEX = () =>
	new RegExp(`^${i18n.t('Opdracht kopie')} [0-9]+`, 'gi');

interface AssignmentProperty {
	name: string;
	label: string;
}

const GET_OBLIGATORY_PROPERTIES = (): AssignmentProperty[] => [
	{
		name: 'title',
		label: i18n.t('titel'),
	},
	{
		name: 'description',
		label: i18n.t('beschrijving'),
	},
	{
		name: 'deadline_at',
		label: i18n.t('deadline'),
	},
	{
		name: 'class_room',
		label: i18n.t('klas of groep'),
	},
];

export class AssignmentService {
	/**
	 * Helper functions for inserting, updating, validating and deleting assigment
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
		delete assignmentToSave.assignment_responses; // = assignmentToSave.assignment_responses || [];
		delete assignmentToSave.assignment_assignment_tags; // = assignmentToSave.assignment_assignment_tags || {
		// 	assignment_tag: [],
		// };
		delete (assignmentToSave as any).__typename;
		return [errors, assignmentToSave as Avo.Assignment.Assignment];
	}

	public static async deleteAssignment(id: number | string) {
		try {
			await dataService.mutate({
				mutation: DELETE_ASSIGNMENT,
				variables: { id },
				update: ApolloCacheManager.clearAssignmentCache,
			});
		} catch (err) {
			console.error(err);
			throw new CustomError('Failed to delete assignment', err, { id });
		}
	}

	public static async updateAssignment(
		assignment: Partial<Avo.Assignment.Assignment>
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

			const response: void | ExecutionResult<
				Avo.Assignment.Assignment
			> = await dataService.mutate({
				mutation: UPDATE_ASSIGNMENT,
				variables: {
					id: assignment.id,
					assignment: assignmentToSave,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			if (!response || !response.data) {
				console.error('assignment update returned empty response', response);
				throw new CustomError('Het opslaan van de opdracht is mislukt', null, { response });
			}

			return assignment as Avo.Assignment.Assignment;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	public static async insertAssignment(
		assignment: Partial<Avo.Assignment.Assignment>
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

			const response: void | ExecutionResult<
				Avo.Assignment.Assignment
			> = await dataService.mutate({
				mutation: INSERT_ASSIGNMENT,
				variables: {
					assignment: assignmentToSave,
				},
				update: ApolloCacheManager.clearAssignmentCache,
			});

			const id = get(response, 'data.insert_app_assignments.returning[0].id');

			if (typeof id !== undefined) {
				return {
					...assignment, // Do not copy the auto modified fields from the validation back into the input controls
					id,
				} as Avo.Assignment.Assignment;
			}

			throw new CustomError('Saving the assignment failed, response id was undefined', null, {
				response,
			});
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	public static async insertDuplicateAssignment(
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

		try {
			return await AssignmentService.insertAssignment(newAssignment);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				i18n.t('assignment/assignment___het-dupliceren-van-de-opdracht-is-mislukt')
			);
			return null;
		}
	}

	public static async duplicateCollectionForAssignment(
		collectionIdOrCollection: string | Avo.Collection.Collection,
		user: Avo.User.User
	): Promise<string> {
		let collection: Avo.Collection.Collection | undefined = undefined;
		if (isString(collectionIdOrCollection)) {
			collection = await CollectionService.fetchCollectionOrBundleById(
				collectionIdOrCollection as string,
				'collection'
			);
		} else {
			collection = collectionIdOrCollection as Avo.Collection.Collection;
		}
		if (!collection) {
			throw new CustomError('The collection for this assigment could not be loaded', null, {
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

	public static async duplicateAssignment(
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

		let duplicatedAssigment: Avo.Assignment.Assignment | null;
		if (!isNil(duplicateCollectionId)) {
			// Insert the duplicated assigment with its duplicated collection id
			duplicatedAssigment = await AssignmentService.insertDuplicateAssignment(newTitle, {
				...initialAssignment,
				content_id: duplicateCollectionId,
			});
		} else {
			// other assignments do not need to have their content_id updated
			duplicatedAssigment = await AssignmentService.insertDuplicateAssignment(
				newTitle,
				initialAssignment
			);
		}

		if (!duplicatedAssigment) {
			throw new CustomError(
				'Failed to copy assigment because the insert method returned null',
				null,
				{
					newTitle,
					initialAssignment,
					user,
				}
			);
		}

		return duplicatedAssigment;
	}

	private static async warnAboutDeadlineInThePast(assignment: Avo.Assignment.Assignment) {
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

	static async getAssignmentById(id: string | number): Promise<Avo.Assignment.Assignment> {
		try {
			const assignmentQuery = {
				query: GET_ASSIGNMENT_BY_ID,
				variables: { id },
			};

			// Get the assigment from graphql
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
				id,
				query: 'GET_ASSIGNMENT_BY_ID',
			});
		}
	}
}
