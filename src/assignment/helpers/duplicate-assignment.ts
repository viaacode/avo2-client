import type { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { tHtml, tText } from '../../shared/helpers/translate';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';

export async function duplicateAssignment(
	user: Avo.User.User,
	assignment?: Avo.Assignment.Assignment
): Promise<Avo.Assignment.Assignment | undefined> {
	try {
		if (!assignment) {
			throw new CustomError(
				'Failed to duplicate the assignment because the assignment is null'
			);
		}

		const newTitle = `${tText('assignment/views/assignment-overview___kopie')} ${
			assignment.title
		}`;

		const response = await AssignmentService.duplicateAssignment(newTitle, assignment, user);

		ToastService.success(
			tHtml('assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt')
		);

		return response;
	} catch (err) {
		console.error('Failed to copy the assignment', err, { assignment });

		ToastService.danger(
			tHtml('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
		);
	}
}
