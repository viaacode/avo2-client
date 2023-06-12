import type { Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash';
import { ReactNode } from 'react';

import { tHtml } from '../../shared/helpers/translate';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';
import { Assignment_v2, Assignment_v2_With_Responses, AssignmentType } from '../assignment.types';

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

export function deleteAssignmentWarning(assignment?: Assignment_v2): ReactNode {
	if (assignment?.lom_learning_resource_type.includes(AssignmentType.BOUW)) {
		return tHtml(
			'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
		);
	}

	if ((assignment as Assignment_v2_With_Responses)?.responses?.length) {
		return tHtml(
			'assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds'
		);
	}

	return tHtml(
		'assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
	);
}
