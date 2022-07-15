import { Avo } from '@viaa/avo2-types';
import { TFunction } from 'i18next';

import { CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';
import { AssignmentService } from '../assignment.service';

export async function duplicateAssignment(
	t: TFunction,
	assignment?: Avo.Assignment.Assignment_v2
): Promise<Avo.Assignment.Assignment_v2 | undefined> {
	try {
		if (!assignment) {
			throw new CustomError(
				'Failed to duplicate the assignment because the assignment is null'
			);
		}

		const newTitle = `${t('assignment/views/assignment-overview___kopie')} ${assignment.title}`;

		const response = await AssignmentService.duplicateAssignment(newTitle, assignment);

		ToastService.success(
			t('assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt')
		);

		return response;
	} catch (err) {
		console.error('Failed to copy the assignment', err, { assignment });

		ToastService.danger(
			t('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
		);
	}
}
