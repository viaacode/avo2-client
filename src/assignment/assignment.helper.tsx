import { IconName } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';

import i18n from '../shared/translations/i18n';
import { Positioned } from '../shared/types';

import {
	Assignment_Label_v2,
	AssignmentLayout,
	AssignmentRetrieveError,
	SimplifiedAssignment,
} from './assignment.types';

export class AssignmentHelper {
	public static getContentLayoutOptions(): RadioOption[] {
		return [
			{
				label: i18n.t('assignment/views/assignment-edit___mediaspeler-met-beschrijving'),
				value: AssignmentLayout.PlayerAndText.toString(),
			},
			{
				label: i18n.t('assignment/views/assignment-edit___enkel-mediaspeler'),
				value: AssignmentLayout.OnlyPlayer.toString(),
			},
		];
	}

	public static getLabels(
		assignment: SimplifiedAssignment,
		type: string
	): { assignment_label: Assignment_Label_v2 }[] {
		return (
			assignment?.labels?.filter((label: any) => label.assignment_label.type === type) || []
		);
	}
}

// Zoek & bouw

export function setPositionToIndex<T>(items: Positioned<T>[]): Positioned<T>[] {
	return items.map((item, i) => {
		return {
			...item,
			position: i,
		};
	});
}

export function getAssignmentErrorObj(errorType: AssignmentRetrieveError): {
	message: string;
	icon: IconName;
} {
	switch (errorType) {
		case AssignmentRetrieveError.DELETED:
			return {
				message: i18n.t('assignment/views/assignment-detail___de-opdracht-werd-verwijderd'),
				icon: 'delete',
			};

		case AssignmentRetrieveError.NOT_YET_AVAILABLE:
			return {
				message: i18n.t(
					'assignment/views/assignment-detail___de-opdracht-is-nog-niet-beschikbaar'
				),
				icon: 'clock',
			};

		default:
			return {
				message: i18n.t(
					'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: 'alert-triangle',
			};
	}
}
