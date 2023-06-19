import { type Avo, ShareWithColleagueTypeEnum } from '@viaa/avo2-types';
import { isNil } from 'lodash';
import { ReactNode } from 'react';

import { tHtml } from '../../shared/helpers/translate';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';
import { AssignmentType } from '../assignment.types';

export async function deleteAssignment(
	id?: string | null,
	user?: Avo.User.User | null
): Promise<void> {
	try {
		if (isNil(id)) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
				)
			);
			return;
		}

		await AssignmentService.deleteAssignment(id);

		trackEvents(
			{
				object: id,
				object_type: 'assignment',
				action: 'delete',
			},
			user
		);

		ToastService.success(
			tHtml('assignment/views/assignment-overview___de-opdracht-is-verwijdert')
		);
	} catch (err) {
		console.error(err);

		ToastService.danger(
			tHtml(
				'assignment/views/assignment-overview___het-verwijderen-van-de-opdracht-is-mislukt'
			)
		);
	}
}

export function deleteAssignmentWarning(assignment?: Avo.Assignment.Assignment): ReactNode {
	const isSharedWithOthers =
		assignment?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_ANDERE;
	const isContributor = assignment?.share_type === ShareWithColleagueTypeEnum.GEDEELD_MET_MIJ;

	if (isSharedWithOthers) {
		return tHtml('assignment/views/assignment-overview___delete-shared-assignment', {
			count: assignment?.contributors?.length || 0,
		});
	}

	if (isContributor) {
		return tHtml('assignment/views/assignment-overview___delete-contributor-assignment');
	}

	if (assignment?.assignment_type?.includes(AssignmentType.BOUW)) {
		return tHtml(
			'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
		);
	}

	if (assignment?.responses?.length) {
		return tHtml(
			'assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds'
		);
	}

	return tHtml(
		'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
	);
}
