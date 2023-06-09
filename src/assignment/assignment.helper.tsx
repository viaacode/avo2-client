import { Column, IconName, Spacer } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';
import { Avo } from '@viaa/avo2-types';
import { BlockItemTypeSchema } from '@viaa/avo2-types/types/core';
import { UserSchema } from '@viaa/avo2-types/types/user';
import { compact, map } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, stripHtml } from '../shared/helpers';
import { groupLoms } from '../shared/helpers/lom';
import { tHtml, tText } from '../shared/helpers/translate';
import { Positioned } from '../shared/types';
import { LomSchemeType } from '../shared/types/lom';

import { MAX_LONG_DESCRIPTION_LENGTH, MAX_SEARCH_DESCRIPTION_LENGTH } from './assignment.const';
import { AssignmentService } from './assignment.service';
import {
	Assignment_Label_v2,
	Assignment_v2_With_Blocks,
	Assignment_v2_With_Labels,
	AssignmentFormState,
	AssignmentLayout,
	AssignmentRetrieveError,
} from './assignment.types';

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
		assignment: Assignment_v2_With_Labels,
		type: string
	): { assignment_label: Assignment_Label_v2 }[] {
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
	assignment: Partial<AssignmentFormState>
): boolean {
	return assignment?.owner_profile_id === user.profile?.id;
}

export function isUserAssignmentContributor(
	user: UserSchema,
	assignment: Partial<AssignmentFormState>
): boolean {
	if (assignment.contributors) {
		return !!assignment.contributors.find(
			(contributor) =>
				contributor.profile_id === user.profile?.id && contributor.rights !== 'VIEWER'
		);
	}
	return false;
}

export const renderLoms = (lomValues: Avo.Lom.LomField[], title: string) => {
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">{title}</p>
			<p className="c-body-1">
				{lomValues.length > 0 ? (
					lomValues.map((lomValue, index) => {
						return (
							<>
								<Link
									key={lomValue?.id + `--${index}`}
									to={{ pathname: lomValue?.id as string }}
									target="_blank"
								>
									{lomValue?.label}
								</Link>{' '}
							</>
						);
					})
				) : (
					<span className="u-d-block">-</span>
				)}
			</p>
		</Spacer>
	);
};

export const renderLomFieldsByGroup = (loms: Avo.Lom.LomField[]) => {
	const groupedLoms = groupLoms(loms);

	const educationLevels: Avo.Lom.LomField[] = groupedLoms['educationLevels'] || [];
	const subjects: Avo.Lom.LomField[] = groupedLoms['subjects'] || [];
	const themes: Avo.Lom.LomField[] = groupedLoms['themes'] || [];

	return (
		<Column size="3-3">
			{educationLevels &&
				renderLoms(educationLevels, tText('assignment/views/assignment-detail___niveaus'))}
			{subjects && renderLoms(subjects, tText('assignment/views/assignment-detail___vakken'))}
			{themes && renderLoms(themes, tText('assignment/views/assignment-detail___themas'))}
		</Column>
	);
};

export const renderCommonMetadata = (assignment: Assignment_v2_With_Blocks): ReactNode => {
	const { created_at, updated_at, loms } = assignment;

	return (
		<>
			{loms && renderLomFieldsByGroup(map(loms, 'lom') as Avo.Lom.LomField[])}
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">
						{tText('assignment/views/assignment-detail___aangemaakt-op')}
					</p>
					<p className="c-body-1">{formatDate(created_at)}</p>
				</Spacer>
			</Column>
			<Column size="3-3">
				<Spacer margin="top-large">
					<p className="u-text-bold">
						{tText('assignment/views/assignment-detail___laatst-aangepast')}
					</p>
					<p className="c-body-1">{formatDate(updated_at)}</p>
				</Spacer>
			</Column>
		</>
	);
};

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
		error: tText('De beschrijving van de opdracht is te lang'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.description ||
			assignment.description.length <= MAX_SEARCH_DESCRIPTION_LENGTH,
	},
	{
		error: tText('De lange beschrijving van de opdracht is te lang'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!(assignment as any).description_long ||
			stripHtml((assignment as any).description_long).length <= MAX_LONG_DESCRIPTION_LENGTH,
	},
];

const VALIDATION_RULES_FOR_PUBLISH: ValidationRule<Partial<Avo.Assignment.Assignment>>[] = [
	{
		error: tText('De opdracht heeft geen titel'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.title,
	},
	{
		error: tText('De opdracht heeft geen beschrijving'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) => !!assignment.description,
	},
	{
		error: tText("De opdracht bevat geen onderwijsniveau's"),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			// !assignment.loms ||
			validateLoms(assignment?.loms, 'educationLevels'),
	},
	{
		error: tText('De opdracht heeft geen vakken'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			validateLoms(assignment?.loms, 'subjects'),
	},
	{
		error: tText("De opdracht heeft geen thema's"),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			validateLoms(assignment?.loms, 'themes'),
	},
	{
		error: tText('de tekst items moeten een titel of beschrijving bevatten'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'TEXT'),
	},
	{
		error: tText('de collecties moeten een titel hebben'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'COLLECTION'),
	},
	{
		error: tText('de video items moeten een titel en beschrijving bevatten'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			!assignment.blocks || validateBlocks(assignment.blocks, 'ITEM'),
	},
];

const validateLoms = (loms: Avo.Lom.Lom[] | undefined, scheme: LomSchemeType) => {
	if (!loms) {
		return false;
	}

	const lomFields = map(loms, 'lom');
	const groupedLoms = groupLoms(lomFields);

	return !!groupedLoms[scheme]?.length;
};

const validateBlocks = (blocks: Avo.Assignment.Block[], type: BlockItemTypeSchema): boolean => {
	if (!blocks || !blocks.length) {
		return false;
	}

	const blocksByType = blocks.filter((block) => block.type === type);

	let isValid = true;

	switch (type) {
		case 'BOUW':
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

	const duplicates = await AssignmentService.getAssignmentsByTitleOrDescription(
		assignment.title || '',
		assignment.description || '',
		assignment.id as string
	);

	if (duplicates.byTitle) {
		errors.push(tText('Een publieke opdracht met deze titel bestaat reeds'));
	}

	if (duplicates.byDescription) {
		errors.push(tText('Een publieke opdracht met deze beschrijving bestaat reeds'));
	}

	return errors;
};
