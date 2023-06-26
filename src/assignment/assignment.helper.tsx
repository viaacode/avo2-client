import { Column, IconName, Spacer } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';
import type { Avo } from '@viaa/avo2-types';
import { LomType } from '@viaa/avo2-types';
import { BlockItemTypeSchema } from '@viaa/avo2-types/types/core';
import { UserSchema } from '@viaa/avo2-types/types/user';
import { compact, map } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, stripHtml } from '../shared/helpers';
import { groupLoms } from '../shared/helpers/lom';
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

export const renderLoms = (lomValues: Avo.Lom.LomField[], title: string) => {
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">{title}</p>
			<p className="c-body-1">
				{lomValues.length > 0 ? (
					lomValues.map((lomValue, index) => {
						return (
							<span key={lomValue?.id + `--${index}`}>
								<Link to={{ pathname: lomValue?.id as string }} target="_blank">
									{lomValue?.label}
								</Link>{' '}
							</span>
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

	const educationLevel: Avo.Lom.LomField[] = groupedLoms[LomType.educationLevel] || [];
	const subject: Avo.Lom.LomField[] = groupedLoms[LomType.subject] || [];
	const theme: Avo.Lom.LomField[] = groupedLoms[LomType.theme] || [];

	return (
		<Column size="3-3">
			{educationLevel &&
				renderLoms(educationLevel, tText('assignment/views/assignment-detail___niveaus'))}
			{subject && renderLoms(subject, tText('assignment/views/assignment-detail___vakken'))}
			{theme && renderLoms(theme, tText('assignment/views/assignment-detail___themas'))}
		</Column>
	);
};

export const renderCommonMetadata = (assignment: Avo.Assignment.Assignment): ReactNode => {
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
		error: tText('assignment/assignment___de-opdracht-bevat-geen-onderwijsniveaus'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			// !assignment.loms ||
			validateLoms(assignment?.loms, LomType.educationLevel),
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-vakken'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			validateLoms(assignment?.loms, LomType.subject),
	},
	{
		error: tText('assignment/assignment___de-opdracht-heeft-geen-themas'),
		isValid: (assignment: Partial<Avo.Assignment.Assignment>) =>
			validateLoms(assignment?.loms, LomType.theme),
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

const validateLoms = (loms: Avo.Lom.Lom[] | undefined, scheme: LomType) => {
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
