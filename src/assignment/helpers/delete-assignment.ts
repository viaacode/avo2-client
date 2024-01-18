import { type Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import { tHtml } from '../../shared/helpers/translate';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { AssignmentService } from '../assignment.service';
import { AssignmentType } from '../assignment.types';

export async function deleteAssignment(
	assignmentId: string | null | undefined,
	user: Avo.User.User,
	afterDeleteCallback?: () => void
): Promise<void> {
	try {
		if (isNil(assignmentId)) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
				)
			);
			return;
		}

		if (!user.profile?.id) {
			ToastService.danger(
				tHtml(
					'assignment/helpers/delete-assignment___kan-opdracht-niet-verwijderen-omdat-de-gebruiker-geen-profiel-id-heeft-probeer-opnieuw-in-te-loggen'
				)
			);
			return;
		}

		await AssignmentService.deleteAssignment(assignmentId);

		trackEvents(
			{
				object: assignmentId,
				object_type: 'assignment',
				action: 'delete',
			},
			user
		);

		afterDeleteCallback?.();

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

export async function deleteSelfFromAssignment(
	assignmentId: string | null | undefined,
	user: Avo.User.User,
	afterDeleteCallback?: () => void
): Promise<void> {
	try {
		if (isNil(assignmentId)) {
			ToastService.danger(
				tHtml(
					'assignment/views/assignment-overview___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
				)
			);
			return;
		}

		if (!user.profile?.id) {
			ToastService.danger(
				tHtml(
					'assignment/helpers/delete-assignment___kan-opdracht-niet-verwijderen-omdat-de-gebruiker-geen-profiel-id-heeft-probeer-opnieuw-in-te-loggen'
				)
			);
			return;
		}

		await AssignmentService.deleteContributor(assignmentId, undefined, user.profile.id);

		afterDeleteCallback?.();

		ToastService.success(
			tHtml(
				'assignment/helpers/delete-assignment___je-bent-geen-bijdrager-meer-aan-de-opdracht'
			)
		);
	} catch (err) {
		console.error(err);

		ToastService.danger(
			tHtml(
				'assignment/helpers/delete-assignment___het-loskoppelen-van-je-account-van-de-opdracht-is-mislukt'
			)
		);
	}
}

export function deleteAssignmentWarning(
	assignment: Avo.Assignment.Assignment | undefined,
	profileId: string | undefined
): ReactNode {
	const isSharedWithOthers = !!assignment?.contributors?.find(
		(contributor) => contributor.profile_id && contributor.profile_id !== profileId
	);
	const isContributor = !!assignment?.contributors?.find(
		(contributor) => contributor.profile_id && contributor.profile_id === profileId
	);

	if (isSharedWithOthers) {
		return tHtml('assignment/views/assignment-overview___delete-shared-assignment', {
			count: assignment?.contributors?.length || 0,
		});
	}

	if (isContributor) {
		return tHtml('assignment/views/assignment-overview___delete-contributor-assignment');
	}

	if (assignment?.lom_learning_resource_type?.includes(AssignmentType.BOUW)) {
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
