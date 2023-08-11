import type { Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';

import { tHtml } from '../../shared/helpers/translate';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { CollectionService } from '../collection.service';

export async function deleteCollection(
	collectionId: string | null | undefined,
	user: Avo.User.User,
	isOwner: boolean,
	isCollection: boolean,
	deleteCallback: () => Promise<void>,
	afterDeleteCallback?: () => void
): Promise<void> {
	try {
		if (isNil(collectionId)) {
			ToastService.danger(
				tHtml(
					'collection/helpers/delete-collection___de-huidige-collectie-werd-nog-nooit-opgeslagen-heeft-geen-id'
				)
			);
			return;
		}

		if (!user.profile?.id) {
			ToastService.danger(
				tHtml(
					'collection/helpers/delete-collection___kan-collectie-niet-verwijderen-omdat-de-gebruiker-geen-profiel-id-heeft-probeer-opnieuw-in-te-loggen'
				)
			);
			return;
		}

		if (isOwner) {
			await deleteCallback();
		} else {
			await CollectionService.deleteContributor(collectionId, undefined, user.profile.id);
		}

		trackEvents(
			{
				object: collectionId,
				object_type: 'collection',
				action: 'delete',
			},
			user
		);

		afterDeleteCallback?.();

		ToastService.success(
			isCollection
				? tHtml(
						'collection/helpers/delete-collection___de-collectie-werd-succesvol-verwijderd'
				  )
				: tHtml(
						'collection/helpers/delete-collection___de-bundel-werd-succesvol-verwijderd'
				  )
		);
	} catch (err) {
		console.error(err);
		ToastService.danger(
			isCollection
				? tHtml(
						'collection/helpers/delete-collection___het-verwijderen-van-de-collectie-is-mislukt'
				  )
				: tHtml(
						'collection/helpers/delete-collection___het-verwijderen-van-de-bundel-is-mislukt'
				  )
		);
	}
}
