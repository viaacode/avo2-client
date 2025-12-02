import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Button,
  ButtonToolbar,
  FormGroup,
  Modal,
  ModalBody,
  RadioButtonGroup,
  Spacer,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { type FC, type ReactNode, useEffect, useState } from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store';
import { APP_PATH } from '../../../constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { getValidationErrorsForPublish } from '../../collection.helpers';
import { CollectionService } from '../../collection.service';
import { type ParentBundle } from '../../collection.types';

interface PublishCollectionModalProps {
  isOpen: boolean
  onClose: (collection?: Avo.Collection.Collection) => void
  collection: Avo.Collection.Collection
  parentBundles: ParentBundle[] | undefined
}

export const PublishCollectionModal: FC<PublishCollectionModalProps> = ({
  onClose,
  isOpen,
  collection,
  parentBundles,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [validationErrors, setValidationErrors] = useState<
    (string | ReactNode)[]
  >([])
  const [isCollectionPublic, setIsCollectionPublic] = useState(
    collection.is_public,
  )

  const isCollection = () => {
    return collection.type_id === 3
  }

  useEffect(() => {
    setIsCollectionPublic(collection.is_public)
  }, [isOpen, setIsCollectionPublic, collection.is_public])

  const onSave = async () => {
    try {
      const isPublished = isCollectionPublic && !collection.is_public
      const isDepublished = !isCollectionPublic && collection.is_public

      // Close modal when isPublic doesn't change
      if (!isPublished && !isDepublished) {
        onClose()
        return
      }

      // Validate if user wants to publish
      if (isPublished) {
        const validationErrorsTemp: string[] =
          await getValidationErrorsForPublish(collection)

        if (validationErrorsTemp && validationErrorsTemp.length) {
          setValidationErrors(validationErrorsTemp)
          ToastService.danger(validationErrorsTemp)
          return
        }
      }

      // Validate if user wants to depublish
      if (isDepublished) {
        const publishedParentBundle = parentBundles?.find(
          (bundle) => bundle.is_public,
        )
        if (publishedParentBundle) {
          const linkToBundle = buildLink(APP_PATH.BUNDLE_DETAIL.route, {
            id: publishedParentBundle.id,
          })
          const error: ReactNode = tHtml(
            'collection/components/modals/publish-collection-modal___deze-collectie-zit-in-a-href-link-to-bundle-een-gepubliceerde-bundel-a-verwijder-eerst-de-collectie-in-die-bundel-en-sla-dan-op',
            { linkToBundle },
          )
          setValidationErrors([error])
          ToastService.danger([error])
          return
        }
      }

      const newCollectionProps: Partial<Avo.Collection.Collection> = {
        is_public: isCollectionPublic,
        published_at: new Date().toISOString(),
      }
      await CollectionService.updateCollectionProperties(
        collection.id,
        newCollectionProps,
      )
      setValidationErrors([])
      ToastService.success(
        isCollection()
          ? isCollectionPublic
            ? tHtml(
                'collection/components/modals/share-collection-modal___de-collectie-staat-nu-publiek',
              )
            : tHtml(
                'collection/components/modals/share-collection-modal___de-collectie-staat-nu-niet-meer-publiek',
              )
          : isCollectionPublic
            ? tHtml(
                'collection/components/modals/share-collection-modal___de-bundel-staat-nu-publiek',
              )
            : tHtml(
                'collection/components/modals/share-collection-modal___de-bundel-staat-nu-niet-meer-publiek',
              ),
      )
      closeModal({
        ...collection,
        ...newCollectionProps,
      })

      // Public status changed => log as event
      trackEvents(
        {
          object: String(collection.id),
          object_type: isCollection() ? 'collection' : 'bundle',
          action: isPublished ? 'publish' : 'unpublish',
        },
        commonUser,
      )
    } catch (err) {
      console.error(
        new CustomError(
          'Failed to save changes to collection/bundle publish status',
          err,
          {
            isCollectionPublic,
            collection,
          },
        ),
      )
      ToastService.danger(
        tHtml(
          'collection/components/modals/share-collection-modal___de-aanpassingen-kunnen-niet-worden-opgeslagen',
        ),
      )
    }
  }

  const closeModal = (newCollection?: Avo.Collection.Collection) => {
    setValidationErrors([])
    onClose(newCollection)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        isCollection()
          ? tHtml(
              'collection/components/modals/share-collection-modal___deel-deze-collectie',
            )
          : tHtml(
              'collection/components/modals/publish-collection-modal___deel-deze-bundel',
            )
      }
      size="large"
      onClose={closeModal}
      scrollable
    >
      <ModalBody>
        <p>
          {isCollection()
            ? tHtml(
                'collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-collectie-toegankelijk-is-voor-andere-personen',
              )
            : tHtml(
                'collection/components/modals/share-collection-modal___bepaal-in-hoeverre-jouw-bundel-toegankelijk-is-voor-andere-personen',
              )}
        </p>
        <FormGroup error={validationErrors}>
          <Spacer margin="top-large">
            <BlockHeading className="u-m-0" type="h4">
              {tHtml(
                'collection/components/modals/share-collection-modal___zichtbaarheid',
              )}
            </BlockHeading>
          </Spacer>
          <RadioButtonGroup
            options={[
              {
                value: 'private',
                label: tText(
                  'collection/components/modals/share-collection-modal___niet-openbaar',
                ),
              },
              {
                value: 'public',
                label: tText(
                  'collection/components/modals/share-collection-modal___openbaar',
                ),
              },
            ]}
            value={isCollectionPublic ? 'public' : 'private'}
            onChange={(value: string) => {
              setIsCollectionPublic(value === 'public')
            }}
          />
        </FormGroup>
        <Toolbar spaced>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={tText(
                    'collection/components/modals/share-collection-modal___annuleren',
                  )}
                  onClick={() => closeModal(collection)}
                />
                <Button
                  type="primary"
                  label={tText(
                    'collection/components/modals/share-collection-modal___opslaan',
                  )}
                  onClick={onSave}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalBody>
    </Modal>
  )
}
