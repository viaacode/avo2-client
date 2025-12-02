import {
  Button,
  ButtonToolbar,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooterRight,
  RadioButton,
  Select,
  Spacer,
  Spinner,
  TextInput,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components'
import { Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { type FC, useCallback, useEffect, useState } from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { VideoStillService } from '../../../shared/services/video-stills-service';
import { CollectionService } from '../../collection.service';
import {
  CollectionOrBundle,
  ContentTypeNumber,
} from '../../collection.types';
import { canManageEditorial } from '../../helpers/can-manage-editorial';

import './AddToBundleModal.scss'

interface AddToBundleModalProps {
  fragmentId: string
  fragmentInfo: Avo.Collection.Collection | Avo.Assignment.Assignment
  fragmentType: Avo.Core.BlockItemType
  isOpen: boolean
  onClose: () => void
}

export const AddToBundleModal: FC<AddToBundleModalProps> = ({
  fragmentId,
  fragmentInfo,
  fragmentType,
  isOpen,
  onClose,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [createNewBundle, setCreateNewBundle] = useState<boolean>(false)
  const [selectedBundleId, setSelectedBundleId] = useState<string>('')
  const [selectedBundle, setSelectedBundle] =
    useState<Avo.Collection.Collection | null>(null)
  const [newBundleTitle, setNewBundleTitle] = useState<string>('')
  const [bundles, setBundles] = useState<Partial<Avo.Collection.Collection>[]>(
    [],
  )

  const fetchBundles = useCallback(
    () =>
      CollectionService.fetchCollectionsOrBundlesByUser(
        CollectionOrBundle.BUNDLE,
        commonUser,
      )
        .then((bundleTitles: Partial<Avo.Collection.Collection>[]) => {
          setBundles(bundleTitles)
          if (!bundleTitles.length) {
            setCreateNewBundle(true)
          }
        })
        .catch((err) => {
          console.error(err)
          ToastService.danger(
            tHtml(
              'collection/components/modals/add-to-bundle-modal___het-ophalen-van-de-bestaande-bundels-is-mislukt',
            ),
          )
        }),
    [commonUser],
  )

  useEffect(() => {
    fetchBundles().catch((err) => {
      console.error('Failed to fetch bundles', err)
      ToastService.danger(
        tHtml(
          'collection/components/modals/add-to-bundle-modal___het-ophalen-van-de-bundels-is-mislukt',
        ),
      )
    })
  }, [fetchBundles])

  useEffect(() => {
    isOpen && fetchBundles()
  }, [isOpen, fetchBundles])

  const setSelectedBundleIdAndGetBundleInfo = async (id: string) => {
    try {
      setSelectedBundle(null)
      setSelectedBundleId(id)
      const collection =
        await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
          id,
          CollectionOrBundle.BUNDLE,
          undefined,
        )
      setSelectedBundle(collection)
    } catch (err) {
      ToastService.danger(
        tHtml(
          'collection/components/modals/add-to-bundle-modal___het-ophalen-van-de-collectie-details-is-mislukt',
        ),
      )
    }
  }

  const getFragment = (
    bundle: Partial<Avo.Collection.Collection>,
  ): Partial<Avo.Collection.Fragment> => {
    return {
      use_custom_fields: false,
      start_oc: null,
      position: (bundle.collection_fragments || []).length,
      external_id: fragmentId,
      end_oc: null,
      custom_title: null,
      custom_description: null,
      collection_uuid: bundle.id,
      item_meta: {
        ...fragmentInfo,
        type_id: ContentTypeNumber.assignment,
      },
      type: fragmentType,
    }
  }

  const addCollectionOrAssignmentToExistingBundle = async (
    bundle: Partial<Avo.Collection.Collection>,
  ) => {
    // Disable apply button
    setIsProcessing(true)

    try {
      if (!bundle.id) {
        throw new CustomError('Bundle id is undefined', null, bundle)
      }
      const fragment = getFragment(bundle)
      delete fragment.item_meta
      fragment.position = bundle.collection_fragments?.length || 0
      await CollectionService.insertFragments(bundle.id, [fragment])

      ToastService.success(
        fragmentType === Avo.Core.BlockItemType.COLLECTION
          ? tHtml(
              'collection/components/modals/add-to-bundle-modal___de-collectie-is-toegevoegd-aan-de-bundel',
            )
          : tHtml(
              'collection/components/modals/add-to-bundle-modal___de-opdracht-is-toegevoegd-aan-de-bundel',
            ),
      )
      onClose()
      trackEvents(
        {
          object: String(fragmentId),
          object_type: 'bundle',
          action: 'add_to',
        },
        commonUser,
      )
    } catch (err) {
      console.error(err)
      ToastService.danger(
        fragmentType === Avo.Core.BlockItemType.COLLECTION
          ? tHtml(
              'collection/components/modals/add-to-bundle-modal___de-collectie-kon-niet-worden-toegevoegd-aan-de-bundel',
            )
          : tHtml(
              'collection/components/modals/add-to-bundle-modal___de-opdracht-kon-niet-worden-toegevoegd-aan-de-bundel',
            ),
      )
    }

    // Re-enable apply button
    setIsProcessing(false)
  }

  const addCollectionOrAssignmentToNewBundle = async () => {
    // Disable "Toepassen" button
    setIsProcessing(true)

    let newBundle: Partial<Avo.Collection.Collection> | null = null
    try {
      // Create new bundle with one fragment in it
      newBundle = {
        title: newBundleTitle,
        thumbnail_path: null,
        is_public: false,
        owner_profile_id: commonUser?.profileId,
        type_id: ContentTypeNumber.bundle,
      }
      try {
        newBundle.thumbnail_path =
          await VideoStillService.getThumbnailForSubject({
            thumbnail_path: undefined,
            collection_fragments: [
              getFragment(newBundle) as Avo.Collection.Fragment,
            ],
          })
      } catch (err) {
        console.error('Failed to find cover image for new collection', err, {
          collectionFragments: [
            getFragment(newBundle) as Avo.Collection.Fragment,
          ],
        })
      }

      // Enable is_managed by default when one of these user groups creates a collection/bundle
      // https://meemoo.atlassian.net/browse/AVO-1453
      if (commonUser && canManageEditorial(commonUser)) {
        newBundle.is_managed = true
      }

      const insertedBundle = await CollectionService.insertCollection(newBundle)

      trackEvents(
        {
          object: String(insertedBundle.id),
          object_type: 'bundle',
          action: 'create',
        },
        commonUser,
      )

      // Add collection to bundle
      await addCollectionOrAssignmentToExistingBundle(insertedBundle)
      await fetchBundles()
      onClose()

      // Re-enable apply button
      setIsProcessing(false)
    } catch (err) {
      console.error('Failed to create bundle', err, {
        variables: {
          bundle: newBundle,
        },
      })
      ToastService.danger(
        tHtml(
          'collection/components/modals/add-to-bundle-modal___de-bundel-kon-niet-worden-aangemaakt',
        ),
      )

      // Re-enable apply button
      setIsProcessing(false)
    }
  }

  const onApply = createNewBundle
    ? addCollectionOrAssignmentToNewBundle
    : () =>
        addCollectionOrAssignmentToExistingBundle(
          selectedBundle as Partial<Avo.Collection.Collection>,
        )

  const handleBundleTitleChange = (title: string) => {
    // AVO-2827: add max title length
    if (title.length > 110) {
      return
    } else {
      setNewBundleTitle(title)
    }
  }

  return (
    <Modal
      title={tHtml(
        'collection/components/modals/add-to-bundle-modal___voeg-collectie-toe-aan-bundel',
      )}
      size="medium"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalBody>
        <div className="c-modal__body-add-collection">
          <Spacer>
            <Form>
              <FormGroup>
                <Spacer margin="bottom">
                  <RadioButton
                    label={tText(
                      'collection/components/modals/add-to-bundle-modal___bestaande-bundel',
                    )}
                    checked={!createNewBundle}
                    value="existing"
                    name="collection"
                    onChange={() => setCreateNewBundle(false)}
                  />
                  <div>
                    {bundles.length ? (
                      <Select
                        id="existingCollection"
                        placeholder={tText(
                          'collection/components/modals/add-to-bundle-modal___kies-bundel',
                        )}
                        options={[
                          ...bundles.map(
                            (bundle: Partial<Avo.Collection.Collection>) => ({
                              label: bundle.title || '',
                              value: String(bundle.id),
                            }),
                          ),
                        ]}
                        value={selectedBundleId}
                        onChange={setSelectedBundleIdAndGetBundleInfo}
                        disabled={createNewBundle}
                      />
                    ) : (
                      <TextInput
                        disabled
                        value={tText(
                          'collection/components/modals/add-to-bundle-modal___je-hebt-nog-geen-bundels',
                        )}
                      />
                    )}
                  </div>
                </Spacer>
                <Spacer margin="bottom">
                  <RadioButton
                    label={tText(
                      'collection/components/modals/add-to-bundle-modal___nieuwe-bundel',
                    )}
                    checked={createNewBundle}
                    value="new"
                    name="bundle"
                    onChange={() => setCreateNewBundle(true)}
                  />
                  <div>
                    <TextInput
                      placeholder={tText(
                        'collection/components/modals/add-to-bundle-modal___bundel-titel',
                      )}
                      disabled={!createNewBundle}
                      value={newBundleTitle}
                      onChange={handleBundleTitleChange}
                    />
                  </div>
                </Spacer>
              </FormGroup>
            </Form>
          </Spacer>
        </div>
      </ModalBody>
      <ModalFooterRight>
        <Toolbar spaced>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                {isProcessing && <Spinner />}
                <Button
                  label={tText(
                    'item/components/modals/add-to-collection-modal___annuleren',
                  )}
                  type="link"
                  block
                  onClick={onClose}
                  disabled={isProcessing}
                />
                <Button
                  label={tText(
                    'item/components/modals/add-to-collection-modal___toepassen',
                  )}
                  type="primary"
                  block
                  title={
                    createNewBundle && !newBundleTitle
                      ? tText(
                          'collection/components/modals/add-to-bundle-modal___u-moet-een-bundel-titel-opgeven',
                        )
                      : !createNewBundle && !selectedBundle
                        ? tText(
                            'collection/components/modals/add-to-bundle-modal___je-moet-een-bundel-kiezen-om-deze-collectie-aan-toe-te-voegen',
                          )
                        : ''
                  }
                  disabled={
                    (createNewBundle && !newBundleTitle) ||
                    (!createNewBundle && !selectedBundle) ||
                    isProcessing
                  }
                  onClick={onApply}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalFooterRight>
    </Modal>
  )
}
