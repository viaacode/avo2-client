import { type Avo } from '@viaa/avo2-types'
import { isNil } from 'es-toolkit'

import { tHtml } from '../../shared/helpers/translate-html';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { CollectionService } from '../collection.service';

export async function deleteCollection(
  collectionId: string | null | undefined,
  commonUser: Avo.User.CommonUser | null | undefined,
  isCollection: boolean,
  deleteCallback: () => Promise<void>,
  afterDeleteCallback?: () => void,
): Promise<void> {
  try {
    if (isNil(collectionId)) {
      ToastService.danger(
        tHtml(
          'collection/helpers/delete-collection___de-huidige-collectie-werd-nog-nooit-opgeslagen-heeft-geen-id',
        ),
      )
      return
    }

    if (!commonUser?.profileId) {
      ToastService.danger(
        tHtml(
          'collection/helpers/delete-collection___kan-collectie-niet-verwijderen-omdat-de-gebruiker-geen-profiel-id-heeft-probeer-opnieuw-in-te-loggen',
        ),
      )
      return
    }

    await deleteCallback()

    trackEvents(
      {
        object: collectionId as string,
        object_type: 'collection',
        action: 'delete',
      },
      commonUser,
    )

    afterDeleteCallback?.()

    ToastService.success(
      isCollection
        ? tHtml(
            'collection/helpers/delete-collection___de-collectie-werd-succesvol-verwijderd',
          )
        : tHtml(
            'collection/helpers/delete-collection___de-bundel-werd-succesvol-verwijderd',
          ),
    )
  } catch (err) {
    console.error(err)
    ToastService.danger(
      isCollection
        ? tHtml(
            'collection/helpers/delete-collection___het-verwijderen-van-de-collectie-is-mislukt',
          )
        : tHtml(
            'collection/helpers/delete-collection___het-verwijderen-van-de-bundel-is-mislukt',
          ),
    )
  }
}

export async function deleteSelfFromCollection(
  collectionId: string | null | undefined,
  commonUser: Avo.User.CommonUser | null | undefined,
  afterDeleteCallback?: () => void,
): Promise<void> {
  try {
    if (isNil(collectionId)) {
      ToastService.danger(
        tHtml(
          'collection/helpers/delete-collection___de-huidige-collectie-werd-nog-nooit-opgeslagen-heeft-geen-id',
        ),
      )
      return
    }

    if (!commonUser?.profileId) {
      ToastService.danger(
        tHtml(
          'collection/helpers/delete-collection___het-loskoppelen-van-je-profiel-van-de-collectie-is-mislukt-omdat-we-je-profiel-id-niet-konden-vinden-probeer-opnieuw-in-te-loggen',
        ),
      )
      return
    }

    await CollectionService.deleteContributor(
      collectionId as string,
      undefined,
      commonUser?.profileId,
    )

    afterDeleteCallback?.()

    ToastService.success(
      tHtml(
        'collection/helpers/delete-collection___je-bent-geen-bijdrager-meer-voor-de-collectie',
      ),
    )
  } catch (err) {
    console.error(err)
    ToastService.danger(
      tHtml(
        'collection/helpers/delete-collection___het-loskoppelen-van-je-profiel-van-de-collectie-is-mislukt',
      ),
    )
  }
}
