import { type Avo } from '@viaa/avo2-types';

import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';

export async function duplicateAssignment(
	assignment: Avo.Assignment.Assignment | null | undefined,
	commonUser?: Avo.User.CommonUser
): Promise<Avo.Assignment.Assignment | null> {
	try {
		if (!assignment) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-detail___de-opdracht-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
				)
			);
			return null;
		}

		if (!commonUser?.profileId) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
				)
			);
			return null;
		}

		const newTitle = `${tText('assignment/views/assignment-overview___kopie')} ${
			assignment.title
		}`;

		const duplicatedAssignment = await AssignmentService.duplicateAssignment(
			newTitle,
			assignment,
			commonUser
		);

		ToastService.success(
			tHtml('assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt')
		);

		return duplicatedAssignment;
	} catch (err) {
		console.error('Failed to copy the assignment', err, { assignment });

		ToastService.danger(
			tHtml('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
		);
		return null;
	}
}
