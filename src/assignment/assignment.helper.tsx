import { IconName } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';
import { Avo, LomSchemeType } from '@viaa/avo2-types';
import { BlockItemTypeSchema } from '@viaa/avo2-types/types/core';
import { UserSchema } from '@viaa/avo2-types/types/user';
import { compact } from 'lodash-es';
import { ReactNode } from 'react';

import { stripHtml } from '../shared/helpers';
import { tHtml, tText } from '../shared/helpers/translate';
import { Positioned } from '../shared/types';

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

export function setPositionToIndex(items: Positioned[]): Positioned[] {
	return items.map((item, i) => {
		return {
			...item,
			position: i,
		};
	});
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
	user: UserSchema,
	assignment: Partial<Avo.Assignment.Assignment>
): boolean {
	return assignment?.owner_profile_id === user.profile?.id;
}

export function isUserAssignmentContributor(
	user: UserSchema,
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

export const getValidationErrorsForPublish = async (
	assignment: Partial<Avo.Assignment.Assignment>
): Promise<string[]> => {
	const validationErrors = [
		...GET_VALIDATION_RULES_FOR_SAVE(),
		...VALIDATION_RULES_FOR_PUBLISH,
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

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule<Partial<Avo.Assignment.Assignment>>[] = [
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-titel'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.title,
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-beschrijving'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.description,
	},
	{
		error: tText('De opdracht bevat geen onderwijs waarden'),
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
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'TEXT'),
	},
	{
		error: tText('assignment/assignment___de-collecties-moeten-een-titel-hebben'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'COLLECTION'),
	},
	{
		error: tText(
			'assignment/assignment___de-video-items-moeten-een-titel-en-beschrijving-bevatten'
		),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'ITEM'),
	},
];

const validateBlocks = (blocks: Avo.Assignment.Block[], type: BlockItemTypeSchema): boolean => {
	if (!blocks || !blocks.length) {
		return false;
	}

	const blocksByType = blocks.filter((block) => block.type === type);

	let isValid = true;

	switch (type) {
		case 'COLLECTION':
			blocksByType.forEach((block) => {
				if (block.use_custom_fields && !block.custom_title) {
					isValid = false;
				}
			});
			break;
		case 'ITEM':
			blocksByType.forEach((block) => {
				if (block.use_custom_fields && (!block.custom_title || !block.custom_description)) {
					isValid = false;
				}
			});
			break;
		case 'TEXT':
			blocksByType.forEach((block) => {
				if (
					!stripHtml(block.custom_title || '').trim() &&
					!stripHtml(block.custom_description || '').trim()
				) {
					isValid = false;
				}
			});
			break;

		case 'ZOEK':
		case 'BOUW':
		default:
			break;
	}

	return isValid;
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
