import { IconName, type RadioOption } from '@viaa/avo2-components';
import { type Avo, LomSchemeType } from '@viaa/avo2-types';
import { compact, orderBy } from 'lodash-es';
import { type ReactNode } from 'react';

import { stripHtml } from '../shared/helpers';
import { tHtml, tText } from '../shared/helpers/translate';
import { type Positioned } from '../shared/types';

import { MAX_LONG_DESCRIPTION_LENGTH, MAX_SEARCH_DESCRIPTION_LENGTH } from './assignment.const';
import { AssignmentService } from './assignment.service';
import { AssignmentLayout, AssignmentRetrieveError } from './assignment.types';

export class AssignmentHelper {
	public static getContentLayoutOptions(): RadioOption[] {
		return [
			{
				label: tText('assignment/views/assignment-edit___mediaspeler-met-beschrijving'),
				value: AssignmentLayout.PlayerAndText.toString(),
			},
			{
				label: tText('assignment/views/assignment-edit___enkel-mediaspeler'),
				value: AssignmentLayout.OnlyPlayer.toString(),
			},
		];
	}

	public static getLabels(
		assignment: Avo.Assignment.Assignment,
		type: string
	): { assignment_label: Avo.Assignment.Label }[] {
		return assignment?.labels?.filter((label) => label.assignment_label.type === type) || [];
	}
}

// Zoek & bouw

/**
 * Reset positions so blocks that were added with the same position, now correctly get their position set based on their position and created_at order and no duplicate positions exist
 * @param items items to reset positions for
 */
export function reorderBlockPositions(items: Positioned[]): Positioned[] {
	const orderedBlocks = orderBy(items || [], ['position', 'created_at'], ['asc', 'asc']);
	orderedBlocks.forEach((block, blockIndex) => {
		block.position = blockIndex;
	});
	return orderedBlocks;
}

/**
 * Reset positions so they follow the current order in the array
 * @param items items to reset positions for
 */
export function setBlockPositionToIndex(items: Positioned[]): Positioned[] {
	items.forEach((block, blockIndex) => {
		block.position = blockIndex;
	});
	return items;
}

export function getAssignmentErrorObj(errorType: AssignmentRetrieveError): {
	message: string | ReactNode;
	icon: IconName;
} {
	switch (errorType) {
		case AssignmentRetrieveError.DELETED:
			return {
				message: tHtml('assignment/views/assignment-detail___de-opdracht-werd-verwijderd'),
				icon: IconName.delete,
			};

		case AssignmentRetrieveError.NOT_YET_AVAILABLE:
			return {
				message: tHtml(
					'assignment/views/assignment-detail___de-opdracht-is-nog-niet-beschikbaar'
				),
				icon: IconName.clock,
			};

		default:
			return {
				message: tHtml(
					'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: IconName.alertTriangle,
			};
	}
}

export function isUserAssignmentOwner(
	user: Pick<Avo.User.User, 'profile'> | Pick<Avo.User.CommonUser, 'profileId'>,
	assignment: Partial<Avo.Assignment.Assignment>
): boolean {
	return (
		assignment?.owner_profile_id ===
		((user as Avo.User.User).profile?.id || (user as Avo.User.CommonUser).profileId)
	);
}

export function isUserAssignmentContributor(
	user: Avo.User.User,
	assignment: Partial<Avo.Assignment.Assignment>
): boolean {
	if (assignment.contributors) {
		return !!assignment.contributors.find(
			(contributor) =>
				contributor.profile_id === user.profile?.id && contributor.rights !== 'VIEWER'
		);
	}
	return false;
}

export const getValidationErrorsForPublishAssignment = async (
	assignment: Partial<Avo.Assignment.Assignment>
): Promise<string[]> => {
	const validationErrors = [
		...GET_VALIDATION_RULES_FOR_SAVE(),
		...GET_VALIDATION_RULES_FOR_PUBLISH(),
	].map((rule) => {
		return rule.isValid(assignment) ? null : getError(rule, assignment);
	});

	const duplicateErrors = await getDuplicateTitleOrDescriptionErrors(assignment);
	return compact([...validationErrors, ...duplicateErrors]);
};

type ValidationRule<T> = {
	error: string | ((object: T) => string);
	isValid: (object: T) => boolean;
};

const GET_VALIDATION_RULES_FOR_SAVE: () => ValidationRule<
	Partial<Avo.Assignment.Assignment>
>[] = () => [
	{
		error: tText('assignment/assignment___de-beschrijving-van-de-opdracht-is-te-lang'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.description ||
			assignment.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
	{
		error: tText('assignment/assignment___de-lange-beschrijving-van-de-opdracht-is-te-lang'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!(assignment as any).description_long ||
			stripHtml((assignment as any).description_long).length <= MAX_LONG_DESCRIPTION_LENGTH,
	},
];

const GET_VALIDATION_RULES_FOR_PUBLISH = (): ValidationRule<
	Partial<Avo.Assignment.Assignment>
>[] => [
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-titel'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.title,
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-beschrijving'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.description,
	},
	{
		error: tText('assignment/assignment___de-opdracht-bevat-geen-onderwijs-waarden'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!!assignment.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.structure),
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-themas'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!!assignment.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.theme),
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-vakken'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!!assignment.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.subject),
	},
	{
		error: tText(
			'assignment/assignment___de-tekst-items-moeten-een-titel-of-beschrijving-bevatten'
		),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => {
			if (!assignment.blocks) {
				return false;
			}
			return areTextBlocksValid(assignment.blocks);
		},
	},
	{
		error: tText('assignment/assignment___de-collecties-moeten-een-titel-hebben'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			areCollectionBlocksValid(assignment.blocks),
	},
];

const areCollectionBlocksValid = (blocks: Avo.Assignment.Block[] | undefined): boolean => {
	return (blocks || [])
		.filter((block) => block.type === 'COLLECTION')
		.every((block) => !block.use_custom_fields || !block.custom_title);
};

const areTextBlocksValid = (blocks: Avo.Assignment.Block[] | undefined): boolean => {
	return (blocks || [])
		.filter((block) => block.type === 'TEXT')
		.every(
			(block) =>
				stripHtml(block.custom_title || '').trim() ||
				stripHtml(block.custom_description || '').trim()
		);
};

function getError<T>(rule: ValidationRule<T>, object: T) {
	if (typeof rule.error === 'string') {
		return rule.error;
	}
	return rule.error(object);
}

export const getDuplicateTitleOrDescriptionErrors = async (
	assignment: Partial<Avo.Assignment.Assignment>
): Promise<string[]> => {
	const errors = [];

	if (!assignment.title || !assignment.description) {
		return [];
	}

	const duplicates = await AssignmentService.getAssignmentsByTitleOrDescription(
		assignment.title || '',
		assignment.description || '',
		assignment.id as string
	);

	if (duplicates.byTitle) {
		errors.push(
			tText('assignment/assignment___een-publieke-opdracht-met-deze-titel-bestaat-reeds')
		);
	}

	if (duplicates.byDescription) {
		errors.push(
			tText(
				'assignment/assignment___een-publieke-opdracht-met-deze-beschrijving-bestaat-reeds'
			)
		);
	}

	return errors;
};
