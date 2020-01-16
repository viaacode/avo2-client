import { ExecutionResult } from '@apollo/react-common';
import { cloneDeep, get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../shared/helpers/error';
import { ApolloCacheManager } from '../shared/services/data-service';
import toastService from '../shared/services/toast-service';

import { AssignmentLayout } from './assignment.types';

interface AssignmentProperty {
	name: string;
	label: string;
}

const OBLIGATORY_PROPERTIES: AssignmentProperty[] = [
	{
		name: 'title',
		label: 'titel',
	},
	{
		name: 'description',
		label: 'beschrijving',
	},
	{
		name: 'deadline_at',
		label: 'deadline',
	},
	{
		name: 'class_room',
		label: 'klas of groep',
	},
];

/**
 * Helper functions for inserting, updating, validating and deleting assigment
 * This will be used by the Assignments view and the AssignmentEdit view
 * @param assignment
 */
const validateAssignment = (
	assignment: Partial<Avo.Assignment.Assignment>
): [string[], Avo.Assignment.Assignment] => {
	const assignmentToSave = cloneDeep(assignment);
	const errors: string[] = [];

	// Validate obligatory fields
	OBLIGATORY_PROPERTIES.forEach((prop: AssignmentProperty) => {
		if (!(assignmentToSave as any)[prop.name]) {
			errors.push(`Een ${prop.label} is verplicht`);
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
};

export const deleteAssignment = async (triggerAssignmentDelete: any, id: number | string) => {
	try {
		await triggerAssignmentDelete({
			variables: { id },
			update: ApolloCacheManager.clearAssignmentCache,
		});
	} catch (err) {
		console.error(err);
		throw new CustomError('Failed to delete assignment', err, { id });
	}
};

export const updateAssignment = async (
	triggerAssignmentUpdate: any,
	assignment: Partial<Avo.Assignment.Assignment>
): Promise<Avo.Assignment.Assignment | null> => {
	try {
		const [validationErrors, assignmentToSave] = validateAssignment({ ...assignment });

		if (validationErrors.length) {
			toastService.danger(validationErrors);
			return null;
		}

		warnAboutDeadlineInThePast(assignmentToSave);

		const response: void | ExecutionResult<
			Avo.Assignment.Assignment
		> = await triggerAssignmentUpdate({
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
};

export const insertAssignment = async (
	triggerAssignmentInsert: any,
	assignment: Partial<Avo.Assignment.Assignment>
): Promise<Avo.Assignment.Assignment | null> => {
	try {
		const [validationErrors, assignmentToSave] = validateAssignment({ ...assignment });

		if (validationErrors.length) {
			toastService.danger(validationErrors);
			return null;
		}

		warnAboutDeadlineInThePast(assignmentToSave);

		const response: void | ExecutionResult<
			Avo.Assignment.Assignment
		> = await triggerAssignmentInsert({
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

		console.error('assignment insert returned empty response', response);
		throw Error('Het opslaan van de opdracht is mislukt');
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const insertDuplicateAssignment = async (
	triggerAssignmentInsert: any,
	title: string,
	assignment: Partial<Avo.Assignment.Assignment> | null
) => {
	if (!assignment) {
		toastService.danger('De opdracht is niet beschikbaar om te dupliceren');
		return;
	}

	const newAssignment = {
		...cloneDeep(assignment),
		title,
	};

	delete newAssignment.id;

	try {
		return await insertAssignment(triggerAssignmentInsert, newAssignment);
	} catch (err) {
		console.error(err);
		toastService.danger('Het dupliceren van de opdracht is mislukt');
	}
};

function warnAboutDeadlineInThePast(assignment: Avo.Assignment.Assignment) {
	// Validate if deadline_at is not in the past
	if (assignment.deadline_at && new Date(assignment.deadline_at) < new Date(Date.now())) {
		toastService.info([
			'De ingestelde deadline ligt in het verleden',
			'De leerlingen zullen dus geen toegang hebben tot deze opdracht.',
		]);
	}
}
