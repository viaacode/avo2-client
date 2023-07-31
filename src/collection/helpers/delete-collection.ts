import { Avo } from '@viaa/avo2-types';
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
				tHtml('De huidige collectie werd nog nooit opgeslagen / heeft geen id')
			);
			return;
		}

		if (!user.profile?.id) {
			ToastService.danger(
				tHtml(
					'Kan collectie niet verwijderen omdat de gebruiker geen profiel id heeft. Probeer opnieuw in te loggen.'
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
				? tHtml('De collectie werd succesvol verwijderd.')
				: tHtml('De bundel werd succesvol verwijderd.')
		);
	} catch (err) {
		console.error(err);
		ToastService.danger(
			isCollection
				? tHtml('Het verwijderen van de collectie is mislukt.')
				: tHtml('Het verwijderen van de bundel is mislukt.')
		);
	}
}
