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

import { commonUserAtom } from '../../authentication/authentication.store';
import type { ParentBundle } from '../../collection/collection.types';
import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers/build-link';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { getValidationErrorsForPublishAssignment } from '../assignment.helper';
import { AssignmentService } from '../assignment.service';

interface PublishAssignmentModalProps {
  isOpen: boolean
  onClose: (assignment?: Avo.Assignment.Assignment) => void
  assignment: Avo.Assignment.Assignment
  parentBundles: ParentBundle[] | undefined
}

export const PublishAssignmentModal: FC<PublishAssignmentModalProps> = ({
  onClose,
  isOpen,
  assignment,
  parentBundles,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [validationErrors, setValidationErrors] = useState<
    (string | ReactNode)[]
  >([])
  const [isAssignmentPublic, setIsAssignmentPublic] = useState(
    assignment.is_public,
  )

  useEffect(() => {
    setIsAssignmentPublic(assignment.is_public)
  }, [isOpen, setIsAssignmentPublic, assignment.is_public])

  const onSave = async () => {
    try {
      const isPublished = isAssignmentPublic && !assignment.is_public
      const isDepublished = !isAssignmentPublic && assignment.is_public

      // Close modal when isPublic doesn't change
      if (!isPublished && !isDepublished) {
        onClose()
        return
      }

      if (!commonUser?.profileId) {
        ToastService.danger(
          'Je moet ingelogd zijn om een opdracht te kunnen publiceren/depubliceren',
        )
        return
      }

      // Validate if user wants to publish
      if (isPublished) {
        const validationErrorsTemp: string[] =
          await getValidationErrorsForPublishAssignment(assignment)

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
            'assignment/modals/publish-assignment-modal___deze-opdracht-zit-in-a-href-link-to-bundle-een-gepubliceerde-bundel-a-verwijder-eerst-de-opdracht-uit-die-bundel-en-sla-dan-op',
            { linkToBundle },
          )
          setValidationErrors([error])
          ToastService.danger([error])
          return
        }
      }

      const newAssignmentProps: Partial<Avo.Assignment.Assignment> = {
        is_public: isAssignmentPublic,
        published_at: new Date().toISOString(),
      }
      await AssignmentService.updateAssignment(
        { ...assignment, ...newAssignmentProps },
        commonUser?.profileId,
      )
      setValidationErrors([])
      ToastService.success(
        isAssignmentPublic
          ? tHtml(
              'assignment/modals/publish-assignment-modal___de-opdracht-staat-nu-publiek',
            )
          : tHtml(
              'assignment/modals/publish-assignment-modal___de-opdracht-staat-nu-niet-meer-publiek',
            ),
      )
      closeModal({
        ...assignment,
        ...newAssignmentProps,
      })

      // Public status changed => log as event
      trackEvents(
        {
          object: String(assignment.id),
          object_type: 'assignment',
          action: isPublished ? 'publish' : 'unpublish',
          resource: {
            education_level: String(assignment?.education_level_id),
          },
        },
        commonUser,
      )
    } catch (err) {
      ToastService.danger(
        tHtml(
          'collection/components/modals/share-collection-modal___de-aanpassingen-kunnen-niet-worden-opgeslagen',
        ),
      )
    }
  }

  const closeModal = (newAssignment?: Avo.Assignment.Assignment) => {
    setValidationErrors([])
    onClose(newAssignment)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={tHtml(
        'assignment/modals/publish-assignment-modal___deel-deze-opdracht',
      )}
      size="large"
      onClose={closeModal}
      scrollable
    >
      <ModalBody>
        <p>
          {tHtml(
            'assignment/modals/publish-assignment-modal___bepaal-in-hoeverre-jouw-opdracht-toegankelijk-is-voor-andere-personen',
          )}
        </p>
        <FormGroup error={validationErrors}>
          <Spacer margin="top-large">
            <BlockHeading className="u-m-0" type="h4">
              {tHtml(
                'assignment/modals/publish-assignment-modal___zichtbaarheid',
              )}
            </BlockHeading>
          </Spacer>
          <RadioButtonGroup
            options={[
              {
                value: 'private',
                label: tText(
                  'assignment/modals/publish-assignment-modal___niet-openbaar',
                ),
              },
              {
                value: 'public',
                label: tText(
                  'assignment/modals/publish-assignment-modal___openbaar',
                ),
              },
            ]}
            value={isAssignmentPublic ? 'public' : 'private'}
            onChange={(value: string) => {
              setIsAssignmentPublic(value === 'public')
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
                    'assignment/modals/publish-assignment-modal___annuleren',
                  )}
                  onClick={() => closeModal(assignment)}
                />
                <Button
                  type="primary"
                  label={tText(
                    'assignment/modals/publish-assignment-modal___opslaan',
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
