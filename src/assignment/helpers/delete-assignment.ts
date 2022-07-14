import { Avo } from '@viaa/avo2-types';
import { UserSchema } from '@viaa/avo2-types/types/user';
import { TFunction } from 'i18next';
import { isNil } from 'lodash';

import { ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { AssignmentService } from '../assignment.service';
import { AssignmentType } from '../assignment.types';

export function deleteAssignment(
	t: TFunction,
	id?: string | null,
	user?: UserSchema | null
): Promise<void> {
	try {
		if (isNil(id)) {
			const reason = t(
				'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
			);

			ToastService.danger(reason);
			return Promise.reject(reason);
		}

		return AssignmentService.deleteAssignment(id).then((res) => {
			trackEvents(
				{
					object: id,
					object_type: 'assignment',
					action: 'delete',
				},
				user
			);

			ToastService.success(
				t('assignment/views/assignment-overview___de-opdracht-is-verwijdert')
			);

			return res;
		});
	} catch (err) {
		console.error(err);

		ToastService.danger(
			t('assignment/views/assignment-overview___het-verwijderen-van-de-opdracht-is-mislukt')
		);

		return Promise.reject(err);
	}
}

export function deleteAssignmentWarning(
	t: TFunction,
	assignment?: Avo.Assignment.Assignment_v2
): string {
	if (assignment?.assignment_type === AssignmentType.BOUW) {
		return t(
			'assignment/views/assignment-overview___deze-opdracht-bevat-mogelijk-collecties-die-eveneens-verwijderd-zullen-worden'
		);
	}

	if (assignment?.responses?.length) {
		return t('assignment/views/assignment-overview___leerlingen-bekeken-deze-opdracht-reeds');
	}

	return t('assignment/views/assignment-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden');
}
