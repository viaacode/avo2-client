import { Column, IconName, Spacer } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';
import { UserSchema } from '@viaa/avo2-types/types/user';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { formatDate } from '../shared/helpers';
import { tHtml, tText } from '../shared/helpers/translate';
import { Positioned } from '../shared/types';

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
				contributor.profile.user_id === user.profile?.id &&
				contributor.enum_right_type.value !== 'VIEWER'
		);
	}
	return false;
}

interface Thesaurus {
	id: string;
	label: string;
	scheme?: string | null | undefined;
}

export const renderLoms = (lomValues: Thesaurus[], title: string) => {
	return (
		<Spacer margin="top-large">
			<p className="u-text-bold">{title}</p>
			<p className="c-body-1">
				{lomValues.length > 0 ? (
					lomValues.map((lomValue, index) => {
						return (
							<>
								<Link
									key={lomValue.id + `--${index}`}
									to={{ pathname: lomValue.id }}
									target="_blank"
								>
									{lomValue.label}
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

export const renderCommonMetadata = (assignment: Assignment_v2_With_Blocks): ReactNode => {
	const { created_at, updated_at, loms } = assignment;
	const levels: Thesaurus[] = [];
	const subjects: Thesaurus[] = [];

	// extract levels and subjects
	if (loms && loms.length > 0) {
		loms.filter((lom) => {
			if (lom.thesaurus.scheme && lom.thesaurus.scheme.endsWith('structuur')) {
				levels.push(lom.thesaurus);
			}
			if (lom.thesaurus.scheme && lom.thesaurus.scheme.endsWith('vak')) {
				subjects.push(lom.thesaurus);
			}
		});
	}

	const addMetaDataColumn = levels.length > 0 || subjects.length > 0;

	return (
		<>
			{addMetaDataColumn && (
				<Column size="3-3">
					{levels &&
						renderLoms(levels, tText('assignment/views/assignment-detail___niveaus'))}
					{subjects &&
						renderLoms(subjects, tText('assignment/views/assignment-detail___vakken'))}
				</Column>
			)}
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
